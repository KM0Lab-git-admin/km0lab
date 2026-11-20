import { useAppStore } from '../stores/useAppStore'
import { currentInviteCode } from '../utils/pendingInvite'

import { publicShopSignup } from './invites'

import type {
  BusinessRegistrationInput,
  BusinessRegistrationResult,
} from '../types/business'

/**
 * Alta de negocio desde la app.
 *
 * Costura con Lovable (`src/services/mock/businessRegistration.ts`,
 * simulada allí). Aquí es `POST /shops/public-signup`: el servidor crea el
 * comercio pendiente de aprobación y, si el alta viene de una invitación,
 * la atribuye con el código guardado. El código postal es el del municipio
 * elegido en la app; el formulario solo enseña su nombre.
 */
export const createBusinessRegistration = async (
  input: BusinessRegistrationInput
): Promise<BusinessRegistrationResult> => {
  const postalCode = useAppStore.getState().postalCode ?? ''
  const inviteCode = currentInviteCode() ?? input.referralReference
  const result = await publicShopSignup({
    name: input.businessName,
    taxId: input.taxId,
    categories: input.category ? [input.category] : [],
    contactEmail: input.email,
    postalCode,
    address: input.address,
    phone: input.phone,
    website: input.website,
    description: input.description,
    inviteCode,
  })
  if (result.status === 'created') {
    return { status: 'created', businessId: result.businessId }
  }
  return { status: 'already_registered' }
}
