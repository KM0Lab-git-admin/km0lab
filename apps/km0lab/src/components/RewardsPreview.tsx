import { useDragScroll } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import {
  Gift,
  Ticket,
  Percent,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

import type { ApiReward } from '@km0lab/app'

import PointsCoin from '@/components/PointsCoin'
import RewardArtwork from '@/components/RewardArtwork'
import { cn } from '@/lib/utils'

export interface RewardsPreviewProps {
  items: ApiReward[]
  onSeeAll?: () => void
  className?: string
}
const ICONS: Record<ApiReward['kind'], LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
}
const BACKGROUNDS: Record<ApiReward['kind'], string> = {
  voucher: 'bg-km0-yellow-100',
  ticket: 'bg-km0-teal-100',
  product: 'bg-km0-coral-50',
  discount: 'bg-km0-blue-100',
}
const RewardsPreview = ({
  items,
  onSeeAll,
  className,
}: RewardsPreviewProps) => {
  const track = useDragScroll('horizontal')
  return (
    <div
      ref={track}
      className={cn(
        'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none data-[dragging=true]:snap-none',
        className
      )}
    >
      {items.slice(0, 5).map((reward) => {
        const Icon = ICONS[reward.kind]
        return (
          <Button
            key={reward.id}
            variant="bubbleSurface"
            onClick={onSeeAll}
            className="h-auto min-w-0 basis-[44%] shrink-0 snap-start flex-col items-stretch justify-start gap-2 whitespace-normal rounded-3xl bg-card p-2.5 text-left shadow-[var(--shadow-bubble)]"
          >
            <span
              className={cn(
                'flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl',
                BACKGROUNDS[reward.kind]
              )}
            >
              <RewardArtwork
                kind={reward.kind}
                imageUrl={reward.imageUrl}
                className="h-full"
              />
            </span>
            <span className="line-clamp-2 min-h-9 font-ui text-[13px] font-bold leading-snug text-km0-blue-800">
              {reward.title}
            </span>
            <PointsCoin points={reward.costPoints} className="self-start" />
          </Button>
        )
      })}
    </div>
  )
}
export default RewardsPreview
