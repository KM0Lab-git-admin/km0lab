import type {
  BusinessRegistrationInput,
  BusinessRegistrationResult,
} from '../../types/business'

const REGISTERED_TAX_IDS_KEY = 'km0_mock_registered_business_tax_ids'

const readRegisteredTaxIds = (): string[] => {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(REGISTERED_TAX_IDS_KEY) ?? '[]'
    )
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export const createBusinessRegistration = async (
  input: BusinessRegistrationInput
): Promise<BusinessRegistrationResult> => {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const taxId = input.taxId.trim().toUpperCase()
  const registered = readRegisteredTaxIds()
  if (registered.includes(taxId)) return { status: 'already_registered' }

  window.localStorage.setItem(
    REGISTERED_TAX_IDS_KEY,
    JSON.stringify([...registered, taxId])
  )
  return { status: 'created', businessId: window.crypto.randomUUID() }
}
