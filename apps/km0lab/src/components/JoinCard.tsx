import { t } from '@km0lab/app'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'

/**
 * JoinCard — tarjeta de registro para el estado guest de la Home
 * ("Missió del barri", spec docs/spec-home-c.md). Sustituye a
 * PointsCard cuando no hay sesión. Presentacional puro.
 */
export interface JoinCardProps {
  onCreateAccount: () => void
}

const JoinCard = ({ onCreateAccount }: JoinCardProps) => {
  const { lang } = useLang()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[600px] rounded-2xl bg-white border border-km0-blue-700/10 shadow-[0_8px_24px_-12px_hsl(var(--km0-blue-900)/0.18)] px-4 py-3 vertical-tablet:px-5 vertical-tablet:py-4 horizontal-mobile:!px-3 horizontal-mobile:!py-2 flex flex-col gap-2"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 vertical-tablet:w-12 vertical-tablet:h-12 horizontal-mobile:!w-8 horizontal-mobile:!h-8 rounded-full bg-km0-yellow-100 flex items-center justify-center">
          <Gift
            className="w-5 h-5 vertical-tablet:w-6 vertical-tablet:h-6 horizontal-mobile:!w-4 horizontal-mobile:!h-4 text-km0-yellow-600"
            strokeWidth={2.2}
          />
        </span>
        <div className="flex-1 min-w-0 flex flex-col leading-tight">
          <h3 className="font-brand font-black text-km0-blue-800 text-base vertical-tablet:text-lg horizontal-mobile:!text-sm">
            {t('home.join.title', lang)}
          </h3>
          <p className="font-body text-km0-blue-700/80 text-xs vertical-tablet:text-sm horizontal-mobile:!text-[11px] mt-1">
            {t('home.join.body', lang)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreateAccount}
        className="w-full rounded-xl bg-km0-yellow-400 hover:bg-km0-yellow-500 active:scale-[0.99] transition-all font-ui font-bold text-km0-blue-900 text-sm vertical-tablet:text-base horizontal-mobile:!text-xs py-2.5 horizontal-mobile:!py-1.5"
      >
        {t('home.join.cta', lang)}
      </button>
      <p className="font-body text-km0-blue-700/60 text-[11px] vertical-tablet:text-xs horizontal-mobile:!text-[10px] text-center">
        {t('home.join.mini', lang)}
      </p>
    </motion.div>
  )
}

export default JoinCard
