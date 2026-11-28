/**
 * Entrar con una red social, cómo entra uno, y cerrar en todos los
 * dispositivos.
 *
 * De producción (candado en el manifest): las costuras del encargo 14 del
 * prototipo (`loginWithProvider`, `useAccessDoors`, `useSignInMethods`,
 * `logoutEverywhere`) con la API de verdad.
 *
 * - Qué redes se ofrecen lo dice el servidor según la plataforma
 *   (`GET /auth/providers`). Sin ninguna encendida, la App queda solo con el
 *   correo.
 * - Entrar con una red es el mismo camino que con el código: condiciones,
 *   aforo, invitación y la misma llegada a la App (`applyAuth` en auth.ts).
 * - Si la red no da un correo de fiar, la API contesta `email_missing` con un
 *   testigo de 15 minutos: se guarda aquí y viaja con el código del correo
 *   que la persona confirme (`verifyOtp`), y la red queda enlazada.
 */
import { useAppStore } from '../stores/useAppStore'
import { TERMS_VERSION } from '../utils/legalText'
import { currentInviteCode } from '../utils/pendingInvite'

import { applyAuth, type SideNotice } from './auth'
import { apiFetch, ApiError, authSchema, messageSchema } from './km0labClient'
import { clearPendingLinkToken, stashLinkToken } from './linkToken'
import { getNetworkCredential, NetworkCancelled } from './socialSdk'

import type {
  AccessError,
  AccessErrorCode,
  AccessProvider,
  AccessResult,
  SignInMethods,
} from '../types/access'

// ── Qué redes se ofrecen ──────────────────────────────────────────────

export interface AuthProviderConfig {
  provider: AccessProvider
  /** Identificador público de nuestra app en esa red. */
  clientId: string
}

const PROVIDERS: AccessProvider[] = ['google', 'facebook', 'apple']
const isProvider = (value: unknown): value is AccessProvider =>
  PROVIDERS.includes(value as AccessProvider)

let providersRequest: Promise<AuthProviderConfig[]> | null = null

/**
 * Las redes encendidas para esta plataforma, en el orden de la App. Se
 * pregunta una vez por apertura; si falla, ninguna (queda el correo).
 */
export const getAuthProviders = (): Promise<AuthProviderConfig[]> => {
  if (!providersRequest) {
    providersRequest = apiFetch<{
      providers?: { provider?: unknown; client_id?: unknown }[]
    }>('/auth/providers')
      .then((out) =>
        (out.providers ?? []).flatMap((p) =>
          isProvider(p.provider) &&
          typeof p.client_id === 'string' &&
          p.client_id
            ? [{ provider: p.provider, clientId: p.client_id }]
            : []
        )
      )
      .catch(() => {
        providersRequest = null
        return []
      })
  }
  return providersRequest
}

/** Solo para las pruebas. */
export const forgetAuthProviders = (): void => {
  providersRequest = null
}

// ── Errores de la API → los códigos de la pantalla ────────────────────

const detailCode = (e: ApiError): string | undefined => {
  const detail = e.detail
  return detail && typeof detail === 'object'
    ? ((detail as { code?: unknown }).code as string | undefined)
    : undefined
}

export const accessErrorFrom = (e: unknown): AccessError => {
  if (e instanceof TypeError) return { code: 'offline', message: 'Offline' }
  if (!(e instanceof ApiError)) {
    return { code: 'provider_failed', message: 'Provider failed' }
  }
  if (e.status === 429) return { code: 'ip_limited', message: e.message }
  const known: Record<string, AccessErrorCode> = {
    pilot_full: 'pilot_full',
    email_missing: 'email_missing',
    identifier_taken: 'identifier_taken',
  }
  const code = detailCode(e)
  return {
    code: (code && known[code]) || 'provider_failed',
    message: e.message,
  }
}

// ── Entrar, o enlazar con la sesión abierta ───────────────────────────

const askNetwork = async (provider: AccessProvider) => {
  const config = (await getAuthProviders()).find((p) => p.provider === provider)
  if (!config)
    throw new ApiError(404, 'provider_disabled', { code: 'provider_disabled' })
  // Apple pide siempre el «nonce» del intento; Google lo comprueba si llega.
  let nonce: { nonce: string; nonce_token: string } | null = null
  if (provider !== 'facebook') {
    nonce = await apiFetch<{ nonce: string; nonce_token: string }>(
      `/auth/social/${provider}/nonce`,
      { method: 'POST' }
    )
  }
  const got = await getNetworkCredential(
    provider,
    config.clientId,
    nonce?.nonce
  )
  return { ...got, nonceToken: nonce?.nonce_token ?? null }
}

/**
 * Entrar con una red. `notice`: lo mismo que tras el código (la cuenta es
 * de la demostración o de otro pueblo).
 */
export const loginWithProvider = async (
  provider: AccessProvider,
  meta?: { referralReference?: string | null }
): Promise<AccessResult & { notice?: SideNotice }> => {
  try {
    const got = await askNetwork(provider)
    const store = useAppStore.getState()
    const postal = store.postalCode ?? null
    const town = store.town ?? null
    const auth = await apiFetch('/auth/social/' + provider, {
      method: 'POST',
      body: {
        credential: got.credential,
        nonce_token: got.nonceToken,
        postal_code: postal ?? undefined,
        invite_code: meta?.referralReference?.trim() || currentInviteCode(),
        terms_version: TERMS_VERSION,
        first_name: got.firstName ?? undefined,
        last_name: got.lastName ?? undefined,
      },
      schema: authSchema,
    })
    clearPendingLinkToken()
    const notice = await applyAuth(auth, { postal, town })
    return { error: null, notice }
  } catch (e) {
    if (e instanceof NetworkCancelled) return { error: null, cancelled: true }
    if (e instanceof ApiError && detailCode(e) === 'email_missing') {
      const token = (e.detail as { link_token?: unknown }).link_token
      if (typeof token === 'string') stashLinkToken(token)
    }
    return { error: accessErrorFrom(e) }
  }
}

/** Enlaza una red a la cuenta con sesión (perfil → «Formes d'entrar»). */
export const linkProvider = async (
  provider: AccessProvider
): Promise<AccessResult> => {
  try {
    const got = await askNetwork(provider)
    const auth = await apiFetch('/auth/social/' + provider, {
      method: 'POST',
      auth: true,
      body: {
        credential: got.credential,
        nonce_token: got.nonceToken,
        terms_version: TERMS_VERSION,
      },
      schema: authSchema,
    })
    // La misma cuenta: solo se renueva su credencial.
    useAppStore.getState().setToken(auth.access_token)
    return { error: null }
  } catch (e) {
    if (e instanceof NetworkCancelled) return { error: null, cancelled: true }
    return { error: accessErrorFrom(e) }
  }
}

// ── Cómo entro yo ─────────────────────────────────────────────────────

interface ApiSignInMethods {
  created_with: string | null
  email: string
  email_hidden?: boolean
  methods: {
    provider: string
    linked_at: string
    last_used_at?: string | null
  }[]
}

/** Lo que enseña el perfil. El correo oculto de Apple no se enseña entero. */
export const signInMethodsFromApi = (m: ApiSignInMethods): SignInMethods => {
  const emailDoor = m.methods.find((d) => d.provider === 'email_code')
  const first = m.methods[0]
  return {
    createdWith: isProvider(m.created_with) ? m.created_with : 'email',
    email: {
      address: m.email,
      linkedAt:
        emailDoor?.linked_at ?? first?.linked_at ?? new Date(0).toISOString(),
    },
    providers: m.methods.flatMap((d) =>
      isProvider(d.provider)
        ? [{ provider: d.provider, linkedAt: d.linked_at }]
        : []
    ),
  }
}

export const getSignInMethods = async (): Promise<SignInMethods> =>
  signInMethodsFromApi(
    await apiFetch<ApiSignInMethods>('/users/me/sign-in-methods', {
      auth: true,
    })
  )

// ── Cerrar en todos los dispositivos ──────────────────────────────────

/**
 * Cierra la sesión de esta cuenta en todos sus dispositivos, este incluido.
 * Si el servidor no lo confirma, no se toca nada aquí: la persona puede
 * reintentar.
 */
export const logoutEverywhere = async (): Promise<{
  error: AccessError | null
}> => {
  try {
    await apiFetch('/auth/logout-all', {
      method: 'POST',
      auth: true,
      schema: messageSchema,
    })
  } catch (e) {
    return { error: accessErrorFrom(e) }
  }
  useAppStore.getState().signOut()
  return { error: null }
}
