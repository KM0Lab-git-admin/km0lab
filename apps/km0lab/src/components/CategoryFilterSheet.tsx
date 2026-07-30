import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import type { CategoriaAdherit, Lang } from '@km0lab/app'
import { t } from '@km0lab/app'
import { cn } from '@/lib/utils'

/**
 * CategoryFilterSheet — bottom sheet de filtro por categoría
 * (mismo patrón que Comerços). Absolute inset: queda dentro de DeviceShell.
 */
export interface CategoryFilterSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  categories: CategoriaAdherit[]
  selected: string
  onSelect: (slug: string) => void
  lang: Lang
}

const CategoryFilterSheet = ({
  open,
  onOpenChange,
  categories,
  selected,
  onSelect,
  lang,
}: CategoryFilterSheetProps) => (
  <AnimatePresence>
    {open ? (
      <div className="absolute inset-0 z-50 flex items-end justify-center">
        <motion.button
          type="button"
          aria-label={t('common.close', lang)}
          onClick={() => onOpenChange(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-km0-blue-900/40"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('merchants.filter_by_category', lang)}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-h-[75%] rounded-t-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
        >
          <header className="shrink-0 flex items-center justify-between gap-2 p-4 border-b border-km0-blue-100">
            <h2 className="font-brand text-base text-km0-blue-900">
              {t('merchants.filter_by_category', lang)}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t('common.close', lang)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-km0-blue-800 hover:bg-km0-beige-100 active:scale-95 transition"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </header>
          <ul className="flex-1 min-h-0 overflow-y-auto py-1">
            {categories.map((cat) => {
              const isSelected = cat.slug === selected
              const label = cat.nom[lang === 'en' ? 'es' : lang]
              return (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(cat.slug)
                      onOpenChange(false)
                    }}
                    aria-pressed={isSelected}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isSelected
                        ? 'bg-km0-blue-50 text-km0-blue-900'
                        : 'hover:bg-km0-beige-50 text-km0-blue-800'
                    )}
                  >
                    <span className="w-6 text-lg" aria-hidden>
                      {cat.emoji ?? '🏷️'}
                    </span>
                    <span
                      className={cn(
                        'flex-1 font-ui text-sm',
                        isSelected && 'font-bold'
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-[11px] font-ui text-km0-blue-700/60 tabular-nums">
                      {cat.count}
                    </span>
                    <span
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-km0-teal-500 bg-km0-teal-500'
                          : 'border-km0-blue-200'
                      )}
                      aria-hidden
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
)

export default CategoryFilterSheet
