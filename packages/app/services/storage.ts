/**
 * storage — adaptador de persistencia compatible con Zustand `persist`.
 *
 * En plataforma nativa usa `@capacitor/preferences` (KV nativo, sobrevive a
 * reinstalaciones del WebView). En web cae a `localStorage` (síncrono).
 *
 * Implementa `StateStorage` de Zustand (getItem/setItem/removeItem),
 * permitiendo valores `Promise` (persist asíncrono).
 */
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

import type { StateStorage } from 'zustand/middleware'

const isNative = Capacitor.isNativePlatform()

export const persistentStorage: StateStorage = {
  async getItem(key) {
    if (isNative) {
      const { value } = await Preferences.get({ key })
      return value ?? null
    }
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  async setItem(key, value) {
    if (isNative) {
      await Preferences.set({ key, value })
      return
    }
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  async removeItem(key) {
    if (isNative) {
      await Preferences.remove({ key })
      return
    }
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}
