import { afterEach, describe, expect, it, vi } from 'vitest'

import { updateProfile } from '../services/profile'
import { useAppStore } from '../stores/useAppStore'

import { apiUser, mockApi } from './helpers'

afterEach(() => vi.unstubAllGlobals())

describe('guardar el perfil', () => {
  it('manda solo lo que la pantalla cambia: no toca el código postal', async () => {
    useAppStore.setState({ lang: 'ca', token: 'jwt' })
    const { first } = mockApi({ 'PATCH /users/me': { json: apiUser() } })

    const { error } = await updateProfile('u1', {
      first_name: '  Marta ',
      last_name: 'Puig',
      phone: null,
      birth_date: '',
    })

    expect(error).toBeNull()
    expect(first().body).toEqual({
      lang: 'ca',
      first_name: 'Marta',
      last_name: 'Puig',
      phone: null,
      birth_date: null,
    })
    // El fallo que esto evita: `postal_code: null` le quitaba el municipio.
    expect(first().body).not.toHaveProperty('postal_code')
  })

  it('cambia el código postal solo cuando se pide', async () => {
    useAppStore.setState({ lang: 'es', token: 'jwt' })
    const { first } = mockApi({
      'PATCH /users/me': { json: apiUser({ postal_code: '17300' }) },
    })

    await updateProfile('u1', { postal_code: '17300' })

    expect(first().body).toEqual({ lang: 'es', postal_code: '17300' })
  })

  it('deja en la app lo que confirma el servidor', async () => {
    useAppStore.setState({ lang: 'ca', token: 'jwt' })
    mockApi({
      'PATCH /users/me': {
        json: apiUser({ first_name: 'Núria', points: 340 }),
      },
    })

    await updateProfile('u1', { first_name: 'Núria' })

    const state = useAppStore.getState()
    expect(state.profiles.u1?.first_name).toBe('Núria')
    expect(state.profiles.u1?.postal_code).toBe('08380')
  })

  it('si el servidor lo rechaza, devuelve el error en vez de romper', async () => {
    useAppStore.setState({ lang: 'ca', token: 'jwt' })
    mockApi({
      'PATCH /users/me': {
        status: 400,
        json: { detail: 'Unknown postal code' },
      },
    })

    const { error } = await updateProfile('u1', { postal_code: '99000' })

    expect(error?.message).toBe('Unknown postal code')
  })
})
