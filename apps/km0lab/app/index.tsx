import { Redirect } from 'expo-router'

/**
 * Pantalla raíz de la app.
 *
 * Por ahora redirige a /language-selection (única pantalla de entrada).
 * Cuando exista flujo de autenticación, esta pantalla decide a dónde
 * llevar al usuario según el estado de sesión:
 *
 * - Sin sesión → /language-selection
 * - Con sesión y onboarding pendiente → /onboarding
 * - Con sesión y onboarding completado → /home (futuro)
 */
export default function RootIndex() {
  return <Redirect href="/language-selection" />
}
