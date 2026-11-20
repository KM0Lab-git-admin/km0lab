import { Button } from '@km0lab/ui'
import { ArrowRight } from 'lucide-react'

import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  /** Optional element next to the title, such as a TownTag. */
  aside?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

const SectionHeader = ({
  title,
  subtitle,
  aside,
  actionLabel,
  onAction,
}: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-lg">
          {title}
        </h2>
        {aside}
      </div>
      {subtitle && (
        <p className="font-body text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {actionLabel && (
      <Button
        variant="bubbleLink"
        type="button"
        onClick={onAction}
        className="h-auto min-h-11 shrink-0 gap-1 px-0 text-xs text-km0-coral-700"
      >
        {actionLabel}
        <ArrowRight size={13} strokeWidth={2.4} />
      </Button>
    )}
  </div>
)

export default SectionHeader
