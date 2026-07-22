import { cn } from '@/lib/utils'

/**
 * WhenTabs — Segmented control para filtrar por rango temporal en la Agenda.
 *
 * Master design KM0:
 *  - Contenedor: km0-beige-50 con borde km0-blue-700/20
 *  - Pestaña activa: km0-blue-600 (azul principal de marca) + texto km0-yellow-400
 *  - Pestaña inactiva: texto km0-blue-700
 *
 * Layout 2×2: garantiza que las etiquetas largas ("Próximos 3 meses",
 * "Próxima semana") nunca se truncan. Pildoras con padding generoso.
 */

export type WhenKey = 'semana' | 'proxima-semana' | 'mes' | 'trimestre'

export interface WhenTabOption {
  key: WhenKey
  label: string
}

export const WHEN_TABS: WhenTabOption[] = [
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Próximos 30 días' },
]

interface WhenTabsProps {
  value: WhenKey
  onChange: (key: WhenKey) => void
  className?: string
}

const WhenTabs = ({ value, onChange, className = '' }: WhenTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Rango temporal"
      className={cn(
        'grid grid-cols-2 gap-1.5 bg-km0-beige-50 border border-km0-blue-700/20 rounded-2xl p-1.5',
        className
      )}
    >
      {WHEN_TABS.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              'min-h-9 rounded-full font-ui text-[11px] vertical-tablet:text-sm font-bold transition-all active:scale-95 px-2 py-1.5 whitespace-nowrap',
              active
                ? 'bg-km0-blue-600 text-km0-yellow-400 shadow-sm'
                : 'text-km0-blue-700 hover:bg-km0-beige-100'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default WhenTabs
