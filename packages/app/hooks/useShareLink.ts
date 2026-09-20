import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useAppStore } from '../stores/useAppStore'
import { t } from '../utils/i18n'

interface UseShareLinkOptions {
  link: string
  text: string
  title: string
}

interface UseShareLink {
  manualCopy: boolean
  linkRef: React.RefObject<HTMLTextAreaElement | null>
  copyLink: () => Promise<void>
  share: () => Promise<void>
}

export const useShareLink = ({
  link,
  text,
  title,
}: UseShareLinkOptions): UseShareLink => {
  const lang = useAppStore((s) => s.lang)
  const [manualCopy, setManualCopy] = useState(false)
  const linkRef = useRef<HTMLTextAreaElement | null>(null)

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(link)
      setManualCopy(false)
      toast.success(t('invite.copied', lang))
    } catch {
      setManualCopy(true)
      window.setTimeout(() => {
        linkRef.current?.focus()
        linkRef.current?.select()
      }, 0)
      toast.error(t('invite.copy_failed', lang))
    }
  }

  const share = async (): Promise<void> => {
    if (!navigator.share) {
      await copyLink()
      return
    }
    try {
      await navigator.share({ title, text })
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await copyLink()
    }
  }

  return { manualCopy, linkRef, copyLink, share }
}
