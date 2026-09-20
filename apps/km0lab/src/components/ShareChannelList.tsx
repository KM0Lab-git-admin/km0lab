import { useShareLink, t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { Copy, Mail, MessageCircle, Share2, ThumbsUp } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'

interface ShareChannelListProps {
  /** Enlace exacto que se comparte en todos los canales. */
  link: string
  /** Mensaje preparado para los canales que lo admiten. */
  message: string
  /** Asunto para el canal de correo. */
  subject: string
}

interface Channel {
  id: string
  label: string
  icon: typeof MessageCircle
  onSelect: () => void
}

/**
 * ShareChannelList — Canales de envío (WhatsApp, correo, Facebook, menú
 * nativo) más copia del enlace con alternativa manual. Compartido por el
 * panel público sin sesión y por la página de invitaciones con sesión.
 */
const ShareChannelList = ({
  link,
  message,
  subject,
}: ShareChannelListProps) => {
  const { lang } = useLang()
  const { manualCopy, linkRef, copyLink, share } = useShareLink({
    link,
    text: message,
    title: t('share.title', lang),
  })

  const openExternal = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const channels: Channel[] = [
    {
      id: 'whatsapp',
      label: t('share.channel.whatsapp', lang),
      icon: MessageCircle,
      onSelect: () =>
        openExternal(`https://wa.me/?text=${encodeURIComponent(message)}`),
    },
    {
      id: 'email',
      label: t('share.channel.email', lang),
      icon: Mail,
      onSelect: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      },
    },
    {
      id: 'facebook',
      label: t('share.channel.facebook', lang),
      icon: ThumbsUp,
      onSelect: () =>
        openExternal(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
        ),
    },
    ...(hasNativeShare
      ? [
          {
            id: 'more',
            label: t('share.channel.more', lang),
            icon: Share2,
            onSelect: () => void share(),
          },
        ]
      : []),
  ]

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {channels.map((channel) => (
          <li key={channel.id}>
            <Button
              type="button"
              variant="outline"
              onClick={channel.onSelect}
              className="h-12 w-full justify-start gap-3 rounded-xl border-km0-blue-100 font-ui text-sm font-bold text-km0-blue-800"
            >
              <channel.icon aria-hidden size={18} />
              {channel.label}
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="ghost"
        onClick={() => void copyLink()}
        className="mt-3 h-11 w-full justify-start gap-3 rounded-xl font-ui text-sm font-bold text-km0-blue-700"
      >
        <Copy aria-hidden size={18} />
        {t('share.copy', lang)}
      </Button>

      {manualCopy && (
        <label className="mt-3 block font-ui text-xs font-bold text-km0-blue-800">
          {t('invite.copy_failed', lang)}
          <textarea
            ref={linkRef}
            readOnly
            rows={2}
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-1 w-full resize-none break-all rounded-lg border border-km0-blue-200 bg-background px-3 py-2 font-body text-xs leading-snug text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      )}
    </div>
  )
}

export default ShareChannelList
