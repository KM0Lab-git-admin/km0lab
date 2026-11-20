import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { CirclePlay, Gift } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'

export interface JoinCardProps {
  onCreateAccount: () => void
  onHowItWorks?: () => void
  onLogin?: () => void
}
const JoinCard = ({
  onCreateAccount,
  onHowItWorks,
  onLogin,
}: JoinCardProps) => {
  const { lang } = useLang()
  return (
    <section className="flex w-full flex-col gap-3 rounded-3xl bg-card p-4 shadow-[var(--shadow-bubble)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-km0-yellow-100 text-km0-yellow-800">
          <Gift aria-hidden size={22} />
        </span>
        <h2 className="font-brand text-lg font-black leading-tight text-km0-blue-800">
          {t('home.join.title', lang)}
        </h2>
      </div>
      <p className="font-ui text-sm leading-relaxed text-km0-blue-700/80">
        {t('home.join.body', lang)}
      </p>
      <Button
        variant="bubblePrimary"
        onClick={onCreateAccount}
        className="w-full"
      >
        {t('home.join.cta', lang)}
      </Button>
      <p className="text-center font-ui text-xs text-km0-blue-700/80">
        {t('home.join.mini', lang)}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-1">
        {onHowItWorks && (
          <Button
            variant="bubbleLink"
            onClick={onHowItWorks}
            className="px-1 text-sm"
          >
            <CirclePlay aria-hidden />
            {t('home.join.how_it_works', lang)}
          </Button>
        )}
        <Button
          variant="bubbleLink"
          onClick={onLogin ?? onCreateAccount}
          className="px-1 text-sm underline underline-offset-4"
        >
          {t('share.login', lang)}
        </Button>
      </div>
    </section>
  )
}
export default JoinCard
