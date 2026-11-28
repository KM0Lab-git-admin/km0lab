/**
 * useAppStore — Estado global unificado (Zustand + persist).
 *
 * Fuente única de verdad para sesión, perfil, idioma y ubicación
 * (CP + población). Persiste en `localStorage` bajo la clave `km0_app`.
 *
 * Setup mínimo (guest):
 *  - `langChosen` — idioma elegido explícitamente (sin eso, ninguna pantalla).
 *  - `postalCode` (+ `town`) — sin eso no hay Home.
 *
 * Las claves sueltas `km0_postal_code` / `km0_town` son un puente de
 * escritura hacia la maqueta de Lovable. RequireSetup, Login y Home
 * leen solo este store.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { persistentStorage } from '../services/storage'
import { LANGS, type Lang } from '../utils/i18n'

import type { TownChoice } from '../types/territory'
import type { PendingScan } from '../utils/pendingScan'

export interface AppUser {
  id: string
  email: string
  /** Saldo de puntos cacheado desde km0lab-api (`user.points`). */
  points: number
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
  /**
   * Compartir el teléfono con la entidad del piloto (desactivado por
   * defecto). La fecha de nacimiento ya no se pide (Legal, 28-11-2026).
   */
  contact_shared: boolean
  postal_code: string | null
  town: string | null
  avatar_url: string | null
  /** Idioma preferido del usuario (ca|es|en) según API. */
  lang: Lang | null
}

export type PendingInvite = {
  code: string
  kind: 'person' | 'business'
  townId?: string | null
  townName?: string | null
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
  pendingInvite: PendingInvite | null
  /** Código de QR abierto por enlace antes de tener sesión. */
  pendingScan: PendingScan | null

  notificationsLastSeenAt: string | null

  /**
   * Demostración: la población o agrupación elegida en la lista que se
   * abre al teclear 00000, o null fuera de la demostración.
   */
  showcaseChoice: TownChoice | null
  /** Dentro de una agrupación, la población que se toma como «mi pueblo». */
  showcaseHomeTownId: string | null
  /** Hay demostración en curso: el marco enseña la marca «Demostració». */
  isShowcase: boolean

  setLang: (l: Lang) => void
  /** Elige idioma y marca la elección explícita (flujo inicial). */
  chooseLang: (l: Lang) => void
  setLocation: (postalCode: string | null, town: string | null) => void

  setSession: (s: AppSession | null) => void
  setToken: (t: string | null) => void
  setPendingOtp: (p: AppState['pendingOtp']) => void
  setPendingInvite: (p: PendingInvite | null) => void
  setPendingScan: (p: PendingScan | null) => void
  /** Actualiza el saldo de puntos del usuario en sesión. */
  setUserPoints: (points: number) => void

  upsertProfile: (userId: string, patch: Partial<AppProfile>) => void
  getProfile: (userId: string) => AppProfile | null

  markNotificationsSeen: () => void
  /** Entra en la demostración con esa elección, o sale de ella con null. */
  setShowcase: (choice: TownChoice | null, homeTownId?: string | null) => void

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
  contact_shared: false,
  postal_code: null,
  town: null,
  avatar_url: null,
  lang: null,
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
      pendingInvite: null,
      pendingScan: null,
      notificationsLastSeenAt: null,
      showcaseChoice: null,
      showcaseHomeTownId: null,
      isShowcase: false,

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
        // Puente unidireccional: el store es la fuente de verdad.
        // Lovable aún lee km0_postal_code/km0_town; nunca al revés.
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
      setPendingInvite: (p) => set({ pendingInvite: p }),
      setPendingScan: (p) => set({ pendingScan: p }),
      setUserPoints: (points) =>
        set((state) => {
          if (!state.session) return state
          const next = Math.max(0, points)
          if (state.session.user.points === next) return state
          return {
            session: {
              ...state.session,
              user: { ...state.session.user, points: next },
            },
          }
        }),

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

      setShowcase: (choice, homeTownId = null) =>
        set({
          showcaseChoice: choice,
          showcaseHomeTownId: choice ? homeTownId : null,
          isShowcase: choice !== null,
        }),

      signOut: () => set({ session: null, token: null, pendingOtp: null }),

      clearLocalSetup: () => {
        clearLegacyLocationKeys()
        set({
          session: null,
          token: null,
          pendingOtp: null,
          pendingInvite: null,
          pendingScan: null,
          profiles: {},
          lang: 'ca',
          langChosen: false,
          postalCode: null,
          town: null,
          notificationsLastSeenAt: null,
          showcaseChoice: null,
          showcaseHomeTownId: null,
          isShowcase: false,
        })
      },
    }),
    {
      name: 'km0_app',
      version: 4,
      storage: createJSONStorage(() => persistentStorage),
      partialize: (s) => ({
        session: s.session,
        token: s.token,
        profiles: s.profiles,
        lang: s.lang,
        langChosen: s.langChosen,
        postalCode: s.postalCode,
        town: s.town,
        pendingInvite: s.pendingInvite,
        // Sobrevive a salir a por el correo del código y volver.
        pendingScan: s.pendingScan,
        notificationsLastSeenAt: s.notificationsLastSeenAt,
        showcaseChoice: s.showcaseChoice,
        showcaseHomeTownId: s.showcaseHomeTownId,
        isShowcase: s.isShowcase,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        const pending =
          current.pendingInvite ??
          (p.pendingInvite as typeof current.pendingInvite) ??
          null
        // Igual que la invitación: si el enlace de un comercio guardó su
        // código antes de terminar de leer lo guardado (en la app nativa la
        // lectura tarda), lo guardado no lo pisa.
        const pendingScan =
          current.pendingScan ??
          (p.pendingScan as typeof current.pendingScan) ??
          null
        // Los perfiles guardados antes traen la fecha de nacimiento, que ya
        // no se pide: se deja fuera, y el teléfono compartido es un sí o no.
        const savedProfiles = (p.profiles ?? {}) as Record<
          string,
          Partial<AppProfile> & { birth_date?: unknown }
        >
        const profiles = Object.fromEntries(
          Object.entries(savedProfiles).map(([id, saved]) => {
            const { birth_date: _dropped, ...rest } = saved
            return [
              id,
              {
                ...emptyProfile(),
                ...rest,
                contact_shared: rest.contact_shared === true,
              },
            ]
          })
        )
        return {
          ...current,
          ...p,
          profiles,
          pendingInvite: pending,
          pendingScan,
        }
      },
      migrate: (persisted, version) => {
        const p = persisted as Record<string, unknown>
        let next = { ...p }
        if (version < 2) {
          // Quien ya tenía CP completó el flujo previo → idioma implícito OK.
          const hasCp = Boolean(p.postalCode)
          next = { ...next, langChosen: hasCp }
        }
        if (version < 3) {
          const session = next.session as
            | { user?: { id?: string; email?: string; points?: number } }
            | null
            | undefined
          if (session?.user) {
            next = {
              ...next,
              session: {
                ...session,
                user: {
                  ...session.user,
                  points:
                    typeof session.user.points === 'number'
                      ? session.user.points
                      : 0,
                },
              },
            }
          }
        }
        if (version < 4) {
          next = { ...next, pendingInvite: next.pendingInvite ?? null }
        }
        return next
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
