// ============= Full file contents =============

import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * WhenTabs — Segmented control para filtrar por rango temporal en la Agenda.
 * Labels vía i18n.
 */

export type WhenKey = 'semana' | 'mes' | 'todos'

export const WHEN_KEYS: WhenKey[] = ['semana', 'mes', 'todos']

interface WhenTabsProps {
  value: WhenKey
  onChange: (key: WhenKey) => void
  className?: string
  compact?: boolean
}

const labelKeyFor = (k: WhenKey) =>
  k === 'semana'
    ? 'agenda.when.week'
    : k === 'mes'
      ? 'agenda.when.month'
      : 'agenda.when.all'

const WhenTabs = ({
  value,
  onChange,
  className = '',
  compact = false,
}: WhenTabsProps) => {
  const { lang } = useLang()

  return (
    <div
      role="tablist"
      aria-label={t('agenda.when.aria', lang)}
      className={cn(
        'flex gap-1 bg-km0-beige-50 border border-km0-blue-700/20 rounded-2xl p-1',
        className
      )}
    >
      {WHEN_KEYS.map((key) => {
        const active = value === key
        return (
          <Button
            variant="bubbleSurface"
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'h-auto min-h-9 flex-auto rounded-full font-ui text-[11px] font-bold transition-all active:scale-95 px-2 py-1.5 whitespace-nowrap',
              compact &&
                'h-auto min-w-0 flex-1 whitespace-normal px-1 text-[10px] leading-tight',
              active
                ? 'bg-km0-blue-600 text-km0-yellow-400 shadow-sm'
                : 'text-km0-blue-700 hover:bg-km0-beige-100'
            )}
          >
            {t(labelKeyFor(key), lang)}
          </Button>
        )
      })}
    </div>
  )
}

export default WhenTabs
