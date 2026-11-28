import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  getSignInMethods,
  linkProvider as linkProviderService,
} from '../services/socialAccess'
import { useAppStore } from '../stores/useAppStore'

import type {
  AccessProvider,
  AccessResult,
  SignInMethods,
} from '../types/access'

export interface UseSignInMethods {
  methods: SignInMethods | null
  loading: boolean
  error: string | null
  reload: () => void
  linkProvider: (provider: AccessProvider) => Promise<AccessResult>
}

/**
 * Cómo entra la persona con sesión: por dónde nació su cuenta y las redes
 * enlazadas. De producción (candado en el manifest); el prototipo lo guarda
 * en su almacén local, aquí lo dice la API (`GET /users/me/sign-in-methods`).
 */
export const useSignInMethods = (): UseSignInMethods => {
  const userId = useAppStore((s) => s.session?.user.id ?? null)
  const client = useQueryClient()
  const key = ['sign-in-methods', userId]
  const query = useQuery({
    queryKey: key,
    queryFn: getSignInMethods,
    enabled: Boolean(userId),
    retry: false,
  })
  const reload = useCallback(() => {
    void query.refetch()
  }, [query])
  const linkProvider = useCallback(
    async (provider: AccessProvider): Promise<AccessResult> => {
      if (!userId) return { error: { message: 'No session' } }
      const result = await linkProviderService(provider)
      if (!result.error && !result.cancelled) {
        await client.invalidateQueries({
          queryKey: ['sign-in-methods', userId],
        })
      }
      return result
    },
    [userId, client]
  )
  return {
    methods: query.data ?? null,
    loading: Boolean(userId) && query.isPending,
    error: query.error ? query.error.message : null,
    reload,
    linkProvider,
  }
}
