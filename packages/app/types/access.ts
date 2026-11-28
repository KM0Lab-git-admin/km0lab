/** Social networks that can open an account; order comes from configuration. */
export type AccessProvider = 'google' | 'facebook' | 'apple'

/** Server-decided access outcomes delivered as error codes. */
export type AccessErrorCode =
  | 'pilot_full'
  | 'ip_limited'
  | 'provider_failed'
  | 'email_missing'
  | 'offline'
  | 'identifier_taken'

export interface AccessError {
  message: string
  code?: AccessErrorCode
}

export interface AccessResult {
  error: AccessError | null
  cancelled?: boolean
}

export interface SignInMethods {
  createdWith: 'email' | AccessProvider
  email: { address: string; linkedAt: string }
  providers: { provider: AccessProvider; linkedAt: string }[]
}
