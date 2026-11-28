import { networkName, t, tf, type Lang } from '@km0lab/app'
import type { AccessProvider } from '@km0lab/app'

import SocialSignInButton, {
  SocialNotice,
  type SocialNoticeValue,
} from '@/components/SocialSignInButton'

interface AccessProviderDoorsProps {
  lang: Lang
  providers: AccessProvider[]
  busyProvider: AccessProvider | null
  disabled?: boolean
  ariaDisabled?: boolean
  onProvider: (provider: AccessProvider) => void
  notice: SocialNoticeValue | null
}
const AccessProviderDoors = ({
  lang,
  providers,
  busyProvider,
  disabled = false,
  ariaDisabled = false,
  onProvider,
  notice,
}: AccessProviderDoorsProps) =>
  providers.length === 0 ? null : (
    <>
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-km0-blue-700/15" />
        <span className="font-body text-xs text-muted-foreground">
          {t('access.divider', lang)}
        </span>
        <div className="h-px flex-1 bg-km0-blue-700/15" />
      </div>
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <SocialSignInButton
            key={provider}
            provider={provider}
            label={tf('access.social.continue', lang, {
              network: networkName(provider, lang),
            })}
            loading={busyProvider === provider}
            disabled={
              disabled || (busyProvider !== null && busyProvider !== provider)
            }
            ariaDisabled={ariaDisabled}
            onClick={() => onProvider(provider)}
          />
        ))}
      </div>
      {notice && <SocialNotice notice={notice} />}
      <p className="font-body text-[11px] leading-snug text-muted-foreground">
        {t('access.social.data', lang)}
      </p>
    </>
  )
export default AccessProviderDoors
