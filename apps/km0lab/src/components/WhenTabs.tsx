import { cn } from '@/lib/utils'
import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'

/**
 * WhenTabs — Segmented control para filtrar por rango temporal en la Agenda.
 * Labels vía i18n.
 */

export type WhenKey = 'semana' | 'proxima-semana' | 'mes' | 'trimestre'

export const WHEN_KEYS: WhenKey[] = ['semana', 'mes']

interface WhenTabsProps {
  value: WhenKey
  onChange: (key: WhenKey) => void
  className?: string
}

const WhenTabs = ({ value, onChange, className = '' }: WhenTabsProps) => {
  const { lang } = useLang()
  const labelFor = (k: WhenKey) =>
    k === 'semana' ? t('agenda.when.week', lang) : t('agenda.when.month', lang)

  return (
    <div
      role="tablist"
      aria-label={t('agenda.when.aria', lang)}
      className={cn(
        'grid grid-cols-2 gap-1.5 bg-km0-beige-50 border border-km0-blue-700/20 rounded-2xl p-1.5',
        className
      )}
    >
      {WHEN_KEYS.map((key) => {
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'min-h-9 rounded-full font-ui text-[11px] font-bold transition-all active:scale-95 px-2 py-1.5 whitespace-nowrap',
              active
                ? 'bg-km0-blue-600 text-km0-yellow-400 shadow-sm'
                : 'text-km0-blue-700 hover:bg-km0-beige-100'
            )}
          >
            {labelFor(key)}
          </button>
        )
      })}
    </div>
  )
}

export default WhenTabs
