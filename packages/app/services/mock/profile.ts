/**
 * Mock del perfil (fase de maquetación).
 *
 * Las firmas imitan al backend real (Railway). El estado vive en
 * `useAppStore` (Zustand) — esto es solo un envoltorio asíncrono.
 */
import { useAppStore, type AppProfile } from '../../stores/useAppStore'

export type MockProfile = AppProfile

// `ensureProfileSeed` se re-exporta desde el store (@km0lab/app) para no
// duplicar el nombre en el barrel; usar el del store directamente.

export const getProfile = async (
  userId: string
): Promise<MockProfile | null> => {
  await new Promise((r) => setTimeout(r, 50))
  return useAppStore.getState().profiles[userId] ?? null
}

export const updateProfile = async (
  userId: string,
  patch: Partial<MockProfile>
): Promise<{ error: { message: string } | null }> => {
  await new Promise((r) => setTimeout(r, 100))
  useAppStore.getState().upsertProfile(userId, patch)
  return { error: null }
}
