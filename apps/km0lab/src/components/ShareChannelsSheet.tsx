import { useIsMobile, useAppStore, t } from '@km0lab/app'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@km0lab/ui'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import ShareChannelList from '@/components/ShareChannelList'
import { useLang } from '@/contexts/LangContext'
import { buildPublicShareLink } from '@/data/inviteConfig'

interface ShareChannelsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ruta a la que volver tras iniciar sesión o crear cuenta. */
  returnTo: string
}

const ShareChannelsSheet = ({
  open,
  onOpenChange,
  returnTo,
}: ShareChannelsSheetProps) => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const town = useAppStore((state) => state.town)

  const townLabel = town ?? t('share.town_fallback', lang)
  const link = useMemo(
    () =>
      typeof window === 'undefined' ? '' : buildPublicShareLink(town, lang),
    [town, lang]
  )
  const message = t('share.message', lang)
    .replace('{town}', townLabel)
    .replace('{link}', link)
  const subject = t('share.email_subject', lang).replace('{town}', townLabel)

  const goToAuth = (): void => {
    onOpenChange(false)
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const body = (
    <div className="px-4 pb-6">
      <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
        {t('share.panel.notice', lang)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={goToAuth}
          className="font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
        >
          {t('share.create_account', lang)}
        </button>
        <button
          type="button"
          onClick={goToAuth}
          className="font-ui text-xs font-bold text-km0-blue-800/70 underline underline-offset-2"
        >
          {t('share.login', lang)}
        </button>
      </div>

      <h3 className="mt-5 font-ui text-sm font-bold text-km0-blue-900">
        {t('share.panel.how', lang)}
      </h3>
      <div className="mt-2">
        <ShareChannelList link={link} message={message} subject={subject} />
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] overflow-y-auto bg-card">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-brand text-lg font-black text-km0-blue-900">
              {t('share.title', lang)}
            </DrawerTitle>
            <DrawerDescription className="font-body text-xs text-km0-blue-800/70">
              {t('share.home.description', lang)}
            </DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto bg-card p-0 sm:max-w-[420px]">
        <DialogHeader className="px-4 pb-2 pt-5 text-left">
          <DialogTitle className="font-brand text-lg font-black text-km0-blue-900">
            {t('share.title', lang)}
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-km0-blue-800/70">
            {t('share.home.description', lang)}
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default ShareChannelsSheet
