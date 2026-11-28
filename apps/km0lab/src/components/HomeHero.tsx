import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { ChevronDown } from 'lucide-react'

import Km0Logo from '@/components/Km0Logo'
import NotificationBell from '@/components/NotificationBell'
import TownArt from '@/components/TownArt'
import UserGreeting from '@/components/UserGreeting'
import { useLang } from '@/contexts/LangContext'

export interface HomeHeroProps {
  cityName: string
  hasAlerts: boolean
  onToggleAlerts: () => void
  showGreeting?: boolean
  townArtSrc?: string | null
  /** Grouped scopes: small "El teu poble" label and the town name as a button. */
  onChangeTown?: () => void
}

const HomeHero = ({
  cityName,
  hasAlerts,
  onToggleAlerts,
  showGreeting = true,
  townArtSrc,
  onChangeTown,
}: HomeHeroProps) => {
  const { lang } = useLang()
  return (
    <header className="relative z-20 shrink-0 overflow-hidden bg-km0-yellow-500 shadow-[var(--shadow-bubble)]">
      <div className="relative min-h-[90px] px-4 py-3">
        <div className="relative z-10 flex w-[56%] min-w-0 flex-col items-start gap-1.5 pr-1">
          {onChangeTown ? (
            <div className="flex min-w-0 flex-col items-start">
              <span className="font-ui text-[11px] font-bold text-km0-blue-800/80">
                {t('territory.homeTown', lang)}
              </span>
              <h1 className="min-w-0 max-w-full">
                <Button
                  variant="bubbleSurface"
                  type="button"
                  onClick={onChangeTown}
                  aria-haspopup="dialog"
                  className="h-auto min-h-0 max-w-full gap-1 whitespace-normal p-0 text-left font-brand text-[21px] font-black leading-tight text-km0-blue-800"
                >
                  {cityName}
                  <ChevronDown
                    aria-hidden
                    className="!h-4 !w-4 shrink-0"
                    strokeWidth={3}
                  />
                </Button>
              </h1>
            </div>
          ) : (
            <h1 className="font-brand text-[21px] font-black leading-tight text-km0-blue-800">
              {cityName}
            </h1>
          )}
          <Km0Logo className="h-[30px] w-auto max-w-full" />
        </div>
        <TownArt
          src={townArtSrc}
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
      {showGreeting && (
        <div>
          <UserGreeting name="Albert" points={1259} nextLevel={3000} />
        </div>
      )}
    </header>
  )
}
export default HomeHero
