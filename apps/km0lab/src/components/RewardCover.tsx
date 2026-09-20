import { useEffect, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface RewardCoverProps {
  imageUrl?: string | null
  fallback: ReactNode
  className?: string
}

/**
 * Portada de premio: foto subida en back office, o icono/gradiente
 * si no hay media (o si el GET de bytes falla).
 */
const RewardCover = ({ imageUrl, fallback, className }: RewardCoverProps) => {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [imageUrl])

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        onError={() => setFailed(true)}
        className={cn('reward-cover-img', className)}
      />
    )
  }

  return <>{fallback}</>
}

export default RewardCover
