import type { RewardKind } from '@km0lab/app'
import type { ReactNode } from 'react'

import PointsCoin from '@/components/PointsCoin'
import RewardArtwork from '@/components/RewardArtwork'

interface RewardCardFrameProps {
  title: string
  description: string
  kind: RewardKind
  imageUrl?: string | null
  points: number
  badge?: ReactNode
  children: ReactNode
}

const RewardCardFrame = ({
  title,
  description,
  kind,
  imageUrl,
  points,
  badge,
  children,
}: RewardCardFrameProps) => (
  <article className="overflow-hidden rounded-3xl bg-card text-km0-blue-800 shadow-[var(--shadow-bubble)]">
    <div className="relative">
      <RewardArtwork kind={kind} imageUrl={imageUrl} />
      <div className="absolute right-3 top-3 max-w-[85%]">{badge}</div>
    </div>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-brand text-base font-black leading-snug">
          {title}
        </h3>
        <PointsCoin points={points} className="shrink-0" />
      </div>
      {description && (
        <p className="font-body text-xs leading-relaxed text-km0-blue-800/70">
          {description}
        </p>
      )}
      {children}
    </div>
  </article>
)

export default RewardCardFrame
