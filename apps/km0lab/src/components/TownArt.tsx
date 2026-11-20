import { useState } from 'react'

import { DEFAULT_TOWN_ART } from '@/data/townArt'

interface TownArtProps {
  src?: string | null
  className?: string
  onLoad?: () => void
  onError?: () => void
}

const TownArt = ({ src, className, onLoad, onError }: TownArtProps) => {
  const requestedSrc = src || DEFAULT_TOWN_ART
  const [loadedSrc, setLoadedSrc] = useState(requestedSrc)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const displayedSrc =
    !src || failedSrc === loadedSrc ? DEFAULT_TOWN_ART : loadedSrc
  const isPending = requestedSrc !== displayedSrc && failedSrc !== requestedSrc
  const acceptImage = () => {
    setLoadedSrc(requestedSrc)
    if (src) onLoad?.()
  }
  const rejectImage = () => {
    setFailedSrc(requestedSrc)
    if (src) onError?.()
  }
  return (
    <>
      <img
        src={displayedSrc}
        onLoad={displayedSrc === requestedSrc ? acceptImage : undefined}
        onError={displayedSrc === requestedSrc ? rejectImage : undefined}
        alt=""
        className={className}
      />
      {isPending && (
        <img
          key={requestedSrc}
          src={requestedSrc}
          alt=""
          aria-hidden="true"
          className="hidden"
          onLoad={acceptImage}
          onError={rejectImage}
        />
      )}
    </>
  )
}

export default TownArt
