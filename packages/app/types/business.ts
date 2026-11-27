export interface BusinessRegistrationInput {
  businessName: string
  taxId: string
  category: string
  description: string
  website: string
  address: string
  town: string
  contactName: string
  email: string
  phone: string
  logoName: string | null
  referralReference: string | null
  acceptedTerms: boolean
}

export type BusinessRegistrationResult =
  | { status: 'created'; businessId: string }
  | { status: 'already_registered' }
