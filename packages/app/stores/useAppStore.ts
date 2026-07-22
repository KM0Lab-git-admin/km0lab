/**
 * useAppStore — Estado global unificado (Zustand + persist).
 *
 * Fuente única de verdad para sesión, perfil, idioma y ubicación
 * (CP + población). Persiste en `localStorage` bajo la clave `km0_app`.
 *
 * Notas de diseño:
 *  - Mientras estamos en fase de mock, los servicios `services/mock/*`
 *    leen y escriben a través de las acciones expuestas aquí
 *    (`setSession`, `setProfile`, …). Cuando llegue el backend real
 *    bastará con que esas mismas acciones se llamen desde el cliente
 *    real (Twilio + SQL en Railway).
 *  - React Query se sigue usando SOLO para datos remotos (eventos del
 *    chat / agenda). Nada local vive en React Query.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { LANGS, type Lang } from '../utils/i18n'

export interface AppUser {
  id: string
  email: string
}

export interface AppSession {
  user: AppUser
  createdAt: string
}

export interface AppProfile {
  first_name: string | null
  last_name: string | null
  email: string | null
  postal_code: string | null
  town: string | null
  avatar_url: string | null
}

interface AppState {
  // session / profile
  session: AppSession | null
  /** Perfiles indexados por userId (multi-cuenta en el mismo dispositivo). */
  profiles: Record<string, AppProfile>

  // i18n + ubicación
  lang: Lang
  postalCode: string | null
  town: string | null

  // pending OTP (entre `requestOtp` y `verifyOtp`)
  pendingOtp: { email: string; postal_code?: string; town?: string } | null

  // ─── actions ───────────────────────────────
  setLang: (l: Lang) => void
  setLocation: (postalCode: string | null, town: string | null) => void

  setSession: (s: AppSession | null) => void
  setPendingOtp: (p: AppState['pendingOtp']) => void

  upsertProfile: (userId: string, patch: Partial<AppProfile>) => void
  getProfile: (userId: string) => AppProfile | null

  signOut: () => void
}

const emptyProfile = (email: string | null = null): AppProfile => ({
  first_name: null,
  last_name: null,
  email,
  postal_code: null,
  town: null,
  avatar_url: null,
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      profiles: {},
      lang: 'es',
      postalCode: null,
      town: null,
      pendingOtp: null,

      setLang: (l) => {
        if (!(LANGS as string[]).includes(l)) return
        set({ lang: l })
      },
      setLocation: (postalCode, town) => set({ postalCode, town }),

      setSession: (s) => set({ session: s }),
      setPendingOtp: (p) => set({ pendingOtp: p }),

      upsertProfile: (userId, patch) =>
        set((state) => {
          const current = state.profiles[userId] ?? emptyProfile()
          return {
            profiles: { ...state.profiles, [userId]: { ...current, ...patch } },
          }
        }),
      getProfile: (userId) => get().profiles[userId] ?? null,

      signOut: () => set({ session: null, pendingOtp: null }),
    }),
    {
      name: 'km0_app',
      version: 1,
      // No persistimos `pendingOtp` (es efímero del flujo OTP en curso).
      partialize: (s) => ({
        session: s.session,
        profiles: s.profiles,
        lang: s.lang,
        postalCode: s.postalCode,
        town: s.town,
      }),
    }
  )
)

/** Helper: crea perfil sembrado si no existe (idempotente). */
export const ensureProfileSeed = (
  user: AppUser,
  metadata?: { postal_code?: string; town?: string }
) => {
  const { profiles, upsertProfile } = useAppStore.getState()
  if (profiles[user.id]) return
  upsertProfile(user.id, {
    ...emptyProfile(user.email),
    postal_code: metadata?.postal_code ?? null,
    town: metadata?.town ?? null,
  })
}
