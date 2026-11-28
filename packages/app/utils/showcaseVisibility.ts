const entryPaths = new Set([
  '/',
  '/onboarding',
  '/how-it-works',
  '/postal-code',
  '/login',
  '/check-email',
])

/** Visibility only: the remembered territory and showcase state are unchanged. */
export function shouldShowShowcaseBadge(
  isShowcase: boolean,
  pathname: string
): boolean {
  return isShowcase && !entryPaths.has(pathname)
}
