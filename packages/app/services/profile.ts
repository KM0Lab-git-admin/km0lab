/**
 * Servicio de perfil real (km0lab-api).
 *
 * Sustituye a `services/mock/profile`. Mantiene las firmas para no tocar la
 * pantalla Profile. El backend expone un `name` único; lo mapeamos a
 * first_name (last_name queda local, se combina al guardar). Usa /users/me
 * (el JWT identifica al usuario), así que el `userId` de la firma se ignora.
 */
import { useAppStore, type AppProfile } from '../stores/useAppStore'

import { apiFetch, ApiError, userSchema, type ApiUser } from './km0labClient'

export type MockProfile = AppProfile

const toProfile = (u: ApiUser): AppProfile => ({
  first_name: u.name,
  last_name: null,
  email: u.email,
  postal_code: u.postal_code,
  town: u.town,
  avatar_url: null,
})

export const getProfile = async (
  _userId: string
): Promise<MockProfile | null> => {
  try {
    const u = await apiFetch('/users/me', { schema: userSchema, auth: true })
    const profile = toProfile(u)
    useAppStore.getState().upsertProfile(u.id, profile)
    return profile
  } catch {
    return null
  }
}

export const updateProfile = async (
  _userId: string,
  patch: Partial<MockProfile>
): Promise<{ error: { message: string } | null }> => {
  const name =
    [patch.first_name, patch.last_name]
      .map((s) => (s ?? '').trim())
      .filter(Boolean)
      .join(' ') || null
  try {
    const u = await apiFetch('/users/me', {
      method: 'PATCH',
      auth: true,
      body: {
        name,
        lang: useAppStore.getState().lang,
        postal_code: patch.postal_code ?? null,
        town: patch.town ?? null,
      },
      schema: userSchema,
    })
    useAppStore.getState().upsertProfile(u.id, toProfile(u))
    return { error: null }
  } catch (e) {
    return {
      error: {
        message: e instanceof ApiError ? e.message : 'No se pudo guardar',
      },
    }
  }
}
