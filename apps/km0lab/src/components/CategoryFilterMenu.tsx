import { Button } from '@km0lab/ui'
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface CategoryFilterOption {
  key: string
  label: string
  icon: ReactNode
  count?: number
}

interface CategoryFilterMenuProps {
  title: string
  allOption: CategoryFilterOption
  options: CategoryFilterOption[]
  selected: string[]
  /** Multiple selections accumulate; single selection closes the menu on pick. */
  multiple?: boolean
  onToggle: (key: string) => void
  onClear: () => void
  className?: string
}

/**
 * Shared category dropdown used by Agenda and Merchants: a compact trigger
 * that sits beside other filters and opens an anchored list of categories.
 */
const CategoryFilterMenu = ({
  title,
  allOption,
  options,
  selected,
  multiple = false,
  onToggle,
  onClear,
  className,
}: CategoryFilterMenuProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const selectedLabels = options
    .filter((o) => selected.includes(o.key))
    .map((o) => o.label)
  const summary =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : allOption.label

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (key: string | null) => {
    if (key === null) onClear()
    else onToggle(key)
    if (!multiple) setOpen(false)
  }

  const renderOption = (
    o: CategoryFilterOption,
    active: boolean,
    key: string | null
  ) => (
    <li key={o.key}>
      <Button
        variant="bubbleSurface"
        type="button"
        role="menuitemcheckbox"
        aria-checked={active}
        onClick={() => pick(key)}
        className={cn(
          'h-auto min-h-11 justify-start whitespace-normal flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-ui text-sm transition-colors',
          active
            ? 'bg-km0-yellow-100 text-km0-blue-900'
            : 'text-km0-blue-800 hover:bg-km0-beige-50'
        )}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-km0-blue-600"
          aria-hidden
        >
          {o.icon}
        </span>
        <span className={cn('min-w-0 flex-1 truncate', active && 'font-bold')}>
          {o.label}
        </span>
        {o.count != null && (
          <span className="shrink-0 text-[11px] tabular-nums text-km0-blue-700/60">
            {o.count}
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2',
            active
              ? 'border-km0-blue-600 bg-km0-blue-600 text-km0-yellow-400'
              : 'border-km0-blue-200'
          )}
        >
          {active && <Check size={12} strokeWidth={3} />}
        </span>
      </Button>
    </li>
  )

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${title}: ${summary}`}
        className={cn(
          'relative h-11 gap-0.5 rounded-2xl border-km0-blue-700/20 bg-km0-beige-50 px-2.5 text-km0-blue-700 hover:bg-km0-beige-100 hover:text-km0-blue-900',
          selected.length > 0 &&
            'border-km0-yellow-400 bg-km0-yellow-400 text-km0-blue-900 hover:bg-km0-yellow-500'
        )}
      >
        <SlidersHorizontal aria-hidden className="!h-4 !w-4" />
        <ChevronDown
          aria-hidden
          className={cn('!h-4 !w-4 transition-transform', open && 'rotate-180')}
        />
        {selected.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-km0-blue-600 px-1 font-ui text-[10px] font-bold text-km0-yellow-400">
            {selected.length}
          </span>
        )}
      </Button>

      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={title}
          className="absolute right-0 top-full z-30 mt-2 flex max-h-80 w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-km0-blue-100 bg-card shadow-lg"
        >
          <p className="shrink-0 border-b border-km0-blue-100 px-3 py-2 font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-km0-blue-500">
            {title}
          </p>
          <ul className="min-h-0 flex-1 overflow-y-auto py-1">
            {renderOption(allOption, selected.length === 0, null)}
            {options.map((o) =>
              renderOption(o, selected.includes(o.key), o.key)
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CategoryFilterMenu
