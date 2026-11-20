import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { ChevronLeft } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import Km0Logo from '@/components/Km0Logo'
import NotificationBell from '@/components/NotificationBell'
import UserGreeting from '@/components/UserGreeting'
import { useLang } from '@/contexts/LangContext'
import { DEFAULT_TOWN_ART } from '@/data/townArt'

export interface HomeHeroProps {
  cityName: string
  hasAlerts: boolean
  onToggleAlerts: () => void
  onBack?: () => void
  backAriaLabel?: string
  showGreeting?: boolean
  greetingSlot?: ReactNode
  showHowItWorks?: boolean
  onHowItWorks?: () => void
  townArtSrc?: string
}

const HomeHero = ({
  cityName,
  hasAlerts,
  onToggleAlerts,
  onBack,
  backAriaLabel,
  showGreeting = true,
  greetingSlot,
  townArtSrc = DEFAULT_TOWN_ART,
}: HomeHeroProps) => {
  const { lang } = useLang()
  const [failedArt, setFailedArt] = useState<string | null>(null)
  if (onBack)
    return (
      <header className="relative z-20 flex shrink-0 items-center gap-2 bg-km0-yellow-500 px-2 py-2 shadow-[var(--shadow-bubble)]">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full bg-card/75 text-km0-blue-800"
          onClick={onBack}
          aria-label={backAriaLabel ?? t('common.back', lang)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          {greetingSlot ?? (
            <h1 className="font-brand text-xl font-black text-km0-blue-800">
              {cityName}
            </h1>
          )}
        </div>
        <NotificationBell
          hasAlerts={hasAlerts}
          onClick={onToggleAlerts}
          ariaLabel={t(
            hasAlerts ? 'notifications.unread' : 'notifications.none',
            lang
          )}
        />
      </header>
    )
  return (
    <header className="relative z-20 shrink-0 overflow-hidden bg-km0-yellow-500 shadow-[var(--shadow-bubble)]">
      <div className="relative min-h-[90px] px-4 py-3">
        <div className="relative z-10 flex w-[56%] min-w-0 flex-col items-start gap-1.5 pr-1">
          <h1 className="font-brand text-[21px] font-black leading-tight text-km0-blue-800">
            {cityName}
          </h1>
          <Km0Logo className="h-[30px] w-auto max-w-full" />
        </div>
        <img
          src={failedArt === townArtSrc ? DEFAULT_TOWN_ART : townArtSrc}
          onError={() => setFailedArt(townArtSrc)}
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 h-[86px] w-[44%] max-w-[190px] select-none object-contain object-right-bottom"
        />
        <NotificationBell
          hasAlerts={hasAlerts}
          onClick={onToggleAlerts}
          ariaLabel={t(
            hasAlerts ? 'notifications.unread' : 'notifications.none',
            lang
          )}
          className="absolute right-3 top-2 z-10"
        />
      </div>
      {(greetingSlot || showGreeting) && (
        <div>
          {greetingSlot ?? (
            <UserGreeting name="Albert" points={1259} nextLevel={3000} />
          )}
        </div>
      )}
    </header>
  )
}
export default HomeHero
