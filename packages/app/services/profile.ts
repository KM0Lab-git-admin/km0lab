/**
 * Servicio de perfil real (km0lab-api).
 *
 * Sustituye a `services/mock/profile`. Mantiene las firmas para no tocar la
 * pantalla Profile. Usa /users/me (el JWT identifica al usuario), así que el
 * `userId` de la firma se ignora.
 */
import { useAppStore, type AppProfile } from '../stores/useAppStore'
import { LANGS, type Lang } from '../utils/i18n'

import { apiFetch, ApiError, userSchema, type ApiUser } from './km0labClient'

export type MockProfile = AppProfile

const toLang = (value: string | null | undefined): Lang | null =>
  value && (LANGS as readonly string[]).includes(value) ? (value as Lang) : null

const toProfile = (u: ApiUser): AppProfile => ({
  first_name: u.first_name ?? u.name,
  last_name: u.last_name ?? null,
  email: u.email,
  phone: u.phone ?? null,
  birth_date: u.birth_date ?? null,
  postal_code: u.postal_code,
  town: u.town,
  avatar_url: null,
  lang: toLang(u.lang),
})

export const getProfile = async (
  _userId: string
): Promise<MockProfile | null> => {
  try {
    const u = await apiFetch('/users/me', { schema: userSchema, auth: true })
    const store = useAppStore.getState()
    const profile = toProfile(u)
    store.upsertProfile(u.id, profile)
    store.setUserPoints(u.points ?? 0)
    if (profile.lang) {
      store.setLang(profile.lang)
    }
    return profile
  } catch {
    return null
  }
}

export const updateProfile = async (
  _userId: string,
  patch: Partial<MockProfile>
): Promise<{ error: { message: string } | null }> => {
  try {
    const store = useAppStore.getState()
    const nextLang = patch.lang ?? store.lang
    const u = await apiFetch('/users/me', {
      method: 'PATCH',
      auth: true,
      body: {
        first_name: patch.first_name?.trim() || null,
        last_name: patch.last_name?.trim() || null,
        lang: nextLang,
        postal_code: patch.postal_code ?? null,
        phone: patch.phone ?? null,
        birth_date: patch.birth_date || null,
      },
      schema: userSchema,
    })
    const profile = toProfile(u)
    store.upsertProfile(u.id, profile)
    store.setUserPoints(u.points ?? 0)
    if (profile.lang) {
      store.setLang(profile.lang)
    }
    return { error: null }
  } catch (e) {
    return {
      error: {
        message: e instanceof ApiError ? e.message : 'No se pudo guardar',
      },
    }
  }
}
