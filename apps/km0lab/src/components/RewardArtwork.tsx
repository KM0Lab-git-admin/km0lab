import { Gift, Ticket, ShoppingBag, Percent } from 'lucide-react'
import { useState } from 'react'

import type { RewardKind } from '@km0lab/app'

import { cn } from '@/lib/utils'

const ICONS = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
}
const BACKGROUNDS: Record<RewardKind, string> = {
  voucher: 'bg-km0-yellow-100',
  ticket: 'bg-km0-teal-100',
  product: 'bg-km0-coral-50',
  discount: 'bg-km0-blue-100',
}

interface RewardArtworkProps {
  kind: RewardKind
  imageUrl?: string | null
  className?: string
}

const RewardArtwork = ({ kind, imageUrl, className }: RewardArtworkProps) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const Icon = ICONS[kind]
  return (
    <div
      className={cn(
        'flex h-36 w-full items-center justify-center overflow-hidden',
        BACKGROUNDS[kind],
        className
      )}
    >
      {imageUrl && failedUrl !== imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          className="h-full w-full object-contain p-4"
        />
      ) : (
        <Icon
          size={48}
          strokeWidth={1.8}
          className="text-km0-blue-800"
          aria-hidden
        />
      )}
    </div>
  )
}

export default RewardArtwork
