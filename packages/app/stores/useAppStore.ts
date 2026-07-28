/**
 * useAppStore — Estado global unificado (Zustand + persist).
 *
 * Fuente única de verdad para sesión, perfil, idioma y ubicación
 * (CP + población). Persiste en `localStorage` bajo la clave `km0_app`.
 *
 * Setup mínimo (guest):
 *  - `langChosen` — idioma elegido explícitamente (sin eso, ninguna pantalla).
 *  - `postalCode` (+ `town`) — sin eso no hay Home.
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
  /** Solo local: km0lab-api todavía no expone teléfono. */
  phone: string | null
  /** Solo local (ISO `YYYY-MM-DD`): km0lab-api todavía no expone fecha de nacimiento. */
  birth_date: string | null
  postal_code: string | null
  town: string | null
  avatar_url: string | null
}

interface AppState {
  session: AppSession | null
  /** JWT del backend km0lab-api (Bearer). Null si no hay sesión. */
  token: string | null
  /** Perfiles indexados por userId (multi-cuenta en el mismo dispositivo). */
  profiles: Record<string, AppProfile>

  lang: Lang
  /** true solo tras pasar por la pantalla de idioma. */
  langChosen: boolean
  postalCode: string | null
  town: string | null

  pendingOtp: { email: string; postal_code?: string; town?: string } | null

  notificationsLastSeenAt: string | null

  setLang: (l: Lang) => void
  /** Elige idioma y marca la elección explícita (flujo inicial). */
  chooseLang: (l: Lang) => void
  setLocation: (postalCode: string | null, town: string | null) => void

  setSession: (s: AppSession | null) => void
  setToken: (t: string | null) => void
  setPendingOtp: (p: AppState['pendingOtp']) => void

  upsertProfile: (userId: string, patch: Partial<AppProfile>) => void
  getProfile: (userId: string) => AppProfile | null

  markNotificationsSeen: () => void

  /** Cierra sesión autenticada (mantiene lang/CP locales). */
  signOut: () => void
  /** Logout guest: borra setup local y vuelve al estado inicial. */
  clearLocalSetup: () => void
}

const emptyProfile = (email: string | null = null): AppProfile => ({
  first_name: null,
  last_name: null,
  email,
  phone: null,
  birth_date: null,
  postal_code: null,
  town: null,
  avatar_url: null,
})

const clearLegacyLocationKeys = () => {
  try {
    localStorage.removeItem('km0_postal_code')
    localStorage.removeItem('km0_town')
  } catch {
    /* ignore */
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      token: null,
      profiles: {},
      lang: 'ca',
      langChosen: false,
      postalCode: null,
      town: null,
      pendingOtp: null,
      notificationsLastSeenAt: null,

      setLang: (l) => {
        if (!(LANGS as string[]).includes(l)) return
        set({ lang: l })
      },
      chooseLang: (l) => {
        if (!(LANGS as string[]).includes(l)) return
        set({ lang: l, langChosen: true })
      },
      setLocation: (postalCode, town) => {
        set({ postalCode, town })
        if (postalCode && town) {
          try {
            localStorage.setItem('km0_postal_code', postalCode)
            localStorage.setItem('km0_town', town)
          } catch {
            /* ignore */
          }
        }
      },

      setSession: (s) => set({ session: s }),
      setToken: (t) => set({ token: t }),
      setPendingOtp: (p) => set({ pendingOtp: p }),

      upsertProfile: (userId, patch) =>
        set((state) => {
          const current = state.profiles[userId] ?? emptyProfile()
          return {
            profiles: { ...state.profiles, [userId]: { ...current, ...patch } },
          }
        }),
      getProfile: (userId) => get().profiles[userId] ?? null,

      markNotificationsSeen: () =>
        set({ notificationsLastSeenAt: new Date().toISOString() }),

      signOut: () => set({ session: null, token: null, pendingOtp: null }),

      clearLocalSetup: () => {
        clearLegacyLocationKeys()
        set({
          session: null,
          token: null,
          pendingOtp: null,
          profiles: {},
          lang: 'ca',
          langChosen: false,
          postalCode: null,
          town: null,
          notificationsLastSeenAt: null,
        })
      },
    }),
    {
      name: 'km0_app',
      version: 2,
      partialize: (s) => ({
        session: s.session,
        token: s.token,
        profiles: s.profiles,
        lang: s.lang,
        langChosen: s.langChosen,
        postalCode: s.postalCode,
        town: s.town,
        notificationsLastSeenAt: s.notificationsLastSeenAt,
      }),
      migrate: (persisted, version) => {
        const p = persisted as Record<string, unknown>
        if (version < 2) {
          // Quien ya tenía CP completó el flujo previo → idioma implícito OK.
          const hasCp = Boolean(p.postalCode)
          return { ...p, langChosen: hasCp }
        }
        return p
      },
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
