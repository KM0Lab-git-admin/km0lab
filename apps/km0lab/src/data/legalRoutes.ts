/** Single source of the legal routes rendered inside the App. */
export const LEGAL_ROUTES = {
  terms: '/condicions',
  privacy: '/privacitat',
} as const

export const isLegalRoute = (pathname: string): boolean =>
  pathname === LEGAL_ROUTES.terms || pathname === LEGAL_ROUTES.privacy
