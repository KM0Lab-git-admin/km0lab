/**
 * Lo que da cada red social al pulsar su botón, en la web.
 *
 * De producción (candado en el manifest). Cada red carga su script solo
 * cuando se pulsa su botón (Legal: no se carga nada de Google, Meta ni Apple
 * a quien no lo pide) y devuelve la credencial que la API comprueba con la
 * red (`km0lab-api` `app/services/social.py`). Aquí no se cree nada de lo
 * que diga la red: solo se entrega.
 *
 * - Google: credencial firmada (Google Identity Services, ventana de Google).
 * - Facebook: testigo de acceso (SDK de JavaScript, ventana emergente).
 * - Apple: credencial firmada y, la primera vez, el nombre (Sign in with
 *   Apple JS, ventana emergente). Lleva siempre el «nonce» del intento.
 *
 * SIN COMPROBAR contra las redes de verdad: hacen falta los identificadores
 * de cliente (pasos de Albert en Google, Meta y Apple).
 */
import type { AccessProvider } from '../types/access'

export interface NetworkCredential {
  credential: string
  /** Apple da el nombre solo la primera vez, y a la app. */
  firstName?: string | null
  lastName?: string | null
}

/** La persona cerró la ventana de la red: no es un error. */
export class NetworkCancelled extends Error {
  constructor() {
    super('cancelled')
  }
}

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'
const FACEBOOK_SCRIPT = 'https://connect.facebook.net/es_ES/sdk.js'
const APPLE_SCRIPT =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/es_ES/appleid.auth.js'
const FACEBOOK_GRAPH_VERSION = 'v27.0'

const loading = new Map<string, Promise<void>>()

/** Carga un script de la red una sola vez, cuando hace falta. */
const loadScript = (src: string): Promise<void> => {
  const cached = loading.get(src)
  if (cached) return cached
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading.delete(src)
      reject(new Error(`No se pudo cargar ${src}`))
    }
    document.head.appendChild(script)
  })
  loading.set(src, promise)
  return promise
}

// ── Google ────────────────────────────────────────────────────────────

interface GoogleId {
  initialize: (options: {
    client_id: string
    nonce?: string
    callback: (response: { credential?: string }) => void
    cancel_on_tap_outside?: boolean
    use_fedcm_for_prompt?: boolean
  }) => void
  prompt: (
    listener?: (moment: {
      isNotDisplayed?: () => boolean
      isSkippedMoment?: () => boolean
      isDismissedMoment?: () => boolean
    }) => void
  ) => void
}

const googleCredential = async (
  clientId: string,
  nonce?: string
): Promise<NetworkCredential> => {
  await loadScript(GOOGLE_SCRIPT)
  const id = (
    window as unknown as { google?: { accounts?: { id?: GoogleId } } }
  ).google?.accounts?.id
  if (!id) throw new Error('Google no respondió')
  return new Promise<NetworkCredential>((resolve, reject) => {
    id.initialize({
      client_id: clientId,
      nonce,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (response.credential) resolve({ credential: response.credential })
        else reject(new NetworkCancelled())
      },
    })
    id.prompt((moment) => {
      if (
        moment.isNotDisplayed?.() ||
        moment.isSkippedMoment?.() ||
        moment.isDismissedMoment?.()
      ) {
        reject(new NetworkCancelled())
      }
    })
  })
}

// ── Facebook ──────────────────────────────────────────────────────────

interface FacebookSdk {
  init: (options: {
    appId: string
    version: string
    cookie?: boolean
    xfbml?: boolean
  }) => void
  login: (
    callback: (response: {
      authResponse?: { accessToken?: string } | null
    }) => void,
    options: { scope: string }
  ) => void
}

let facebookReady: string | null = null

const facebookCredential = async (
  appId: string
): Promise<NetworkCredential> => {
  await loadScript(FACEBOOK_SCRIPT)
  const FB = (window as unknown as { FB?: FacebookSdk }).FB
  if (!FB) throw new Error('Facebook no respondió')
  if (facebookReady !== appId) {
    // Sin cookies de Facebook en nuestro dominio: la sesión es la nuestra.
    FB.init({
      appId,
      version: FACEBOOK_GRAPH_VERSION,
      cookie: false,
      xfbml: false,
    })
    facebookReady = appId
  }
  return new Promise<NetworkCredential>((resolve, reject) => {
    // Solo nombre y correo (Legal: nada más).
    FB.login(
      (response) => {
        const token = response.authResponse?.accessToken
        if (token) resolve({ credential: token })
        else reject(new NetworkCancelled())
      },
      { scope: 'public_profile,email' }
    )
  })
}

// ── Apple ─────────────────────────────────────────────────────────────

interface AppleIdAuth {
  init: (options: {
    clientId: string
    scope: string
    redirectURI: string
    usePopup: boolean
    nonce?: string
  }) => void
  signIn: () => Promise<{
    authorization?: { id_token?: string }
    user?: { name?: { firstName?: string; lastName?: string } }
  }>
}

const appleCredential = async (
  clientId: string,
  nonce?: string
): Promise<NetworkCredential> => {
  await loadScript(APPLE_SCRIPT)
  const auth = (window as unknown as { AppleID?: { auth?: AppleIdAuth } })
    .AppleID?.auth
  if (!auth) throw new Error('Apple no respondió')
  auth.init({
    clientId,
    scope: 'name email',
    // La misma página: con ventana emergente, Apple devuelve el resultado
    // aquí. Es la dirección de retorno dada de alta en Apple.
    redirectURI: `${window.location.origin}/login`,
    usePopup: true,
    nonce,
  })
  try {
    const result = await auth.signIn()
    const credential = result.authorization?.id_token
    if (!credential) throw new NetworkCancelled()
    return {
      credential,
      firstName: result.user?.name?.firstName ?? null,
      lastName: result.user?.name?.lastName ?? null,
    }
  } catch (e) {
    const code = (e as { error?: unknown } | null)?.error
    if (
      e instanceof NetworkCancelled ||
      code === 'popup_closed_by_user' ||
      code === 'user_cancelled_authorize'
    ) {
      throw new NetworkCancelled()
    }
    throw e
  }
}

/** La credencial de la red, o `NetworkCancelled` si la persona cerró. */
export const getNetworkCredential = (
  provider: AccessProvider,
  clientId: string,
  nonce?: string
): Promise<NetworkCredential> => {
  if (provider === 'google') return googleCredential(clientId, nonce)
  if (provider === 'facebook') return facebookCredential(clientId)
  return appleCredential(clientId, nonce)
}
