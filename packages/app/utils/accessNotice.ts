import { networkName, t, tf, type Lang } from '../utils/i18nProd'

import type { AccessError, AccessProvider } from '../types/access'

export const getAccessNotice = (
  provider: AccessProvider,
  error: AccessError,
  lang: Lang
) => {
  if (error.code === 'email_missing') return null
  const network = networkName(provider, lang)
  const tone = 'error' as const
  if (error.code === 'offline')
    return { tone, message: t('access.offline', lang) }
  return { tone, message: tf('access.social.failed', lang, { network }) }
}
