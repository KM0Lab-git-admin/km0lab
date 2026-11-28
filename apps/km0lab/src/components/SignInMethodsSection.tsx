import { networkName, t, tf } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { Loader2, Mail } from 'lucide-react'
import { useState } from 'react'

import type {
  AccessProvider,
  AccessResult,
  Lang,
  SignInMethods,
} from '@km0lab/app'

import BubbleSheet from '@/components/BubbleSheet'
import SocialSignInButton, {
  SocialNotice,
  type SocialNoticeValue,
} from '@/components/SocialSignInButton'

export interface SignInMethodsSectionProps {
  lang: Lang
  methods: SignInMethods | null
  loading: boolean
  error: string | null
  onRetry: () => void
  /** Networks active on this platform, already ordered. */
  providers: AccessProvider[]
  onLink: (provider: AccessProvider) => Promise<AccessResult>
}

const LOCALE: Record<Lang, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' }
const formatDate = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALE[lang], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))

const FirstBadge = ({ lang }: { lang: Lang }) => (
  <span className="rounded-full bg-km0-yellow-100 px-2 py-0.5 font-ui text-[10px] font-bold text-km0-blue-800">
    {t('access.methods.first', lang)}
  </span>
)

/** Profile section listing how the account signs in; linking happens in a sheet. */
const SignInMethodsSection = ({
  lang,
  methods,
  loading,
  error,
  onRetry,
  providers,
  onLink,
}: SignInMethodsSectionProps) => {
  const [linking, setLinking] = useState<AccessProvider | null>(null)
  const [busy, setBusy] = useState(false)
  const [sheetNotice, setSheetNotice] = useState<SocialNoticeValue | null>(null)
  const [linkedNotice, setLinkedNotice] = useState<string | null>(null)

  const openSheet = (provider: AccessProvider) => {
    setSheetNotice(null)
    setLinkedNotice(null)
    setLinking(provider)
  }
  const closeSheet = () => {
    if (!busy) setLinking(null)
  }

  const link = async (provider: AccessProvider) => {
    const network = networkName(provider, lang)
    setSheetNotice(null)
    setBusy(true)
    const { error: linkError, cancelled } = await onLink(provider)
    setBusy(false)
    if (cancelled) return
    if (!linkError) {
      setLinking(null)
      setLinkedNotice(tf('access.methods.added', lang, { network }))
      return
    }
    const key =
      linkError.code === 'identifier_taken'
        ? 'access.methods.conflict'
        : linkError.code === 'offline'
          ? 'access.offline'
          : 'access.social.failed'
    setSheetNotice({ tone: 'error', message: tf(key, lang, { network }) })
  }

  const linkedProviders = methods?.providers ?? []
  const rows: AccessProvider[] = [
    ...providers,
    ...linkedProviders
      .map((p) => p.provider)
      .filter((p) => !providers.includes(p)),
  ]
  const originName = methods
    ? methods.createdWith === 'email'
      ? t('access.methods.origin_email', lang)
      : networkName(methods.createdWith, lang)
    : ''

  return (
    <section
      aria-labelledby="sign-in-methods-title"
      className="flex flex-col gap-2"
    >
      <div className="px-1">
        <h2
          id="sign-in-methods-title"
          className="font-ui text-sm font-bold text-km0-blue-800"
        >
          {t('access.methods.title', lang)}
        </h2>
        {methods && (
          <p className="font-body text-xs text-muted-foreground">
            {tf('access.methods.origin', lang, { method: originName })}
          </p>
        )}
      </div>

      {loading && (
        <p
          role="status"
          className="flex items-center gap-2 px-1 font-body text-xs text-muted-foreground"
        >
          <Loader2
            aria-hidden
            size={16}
            className="animate-spin text-km0-blue-700"
          />
          {t('access.methods.loading', lang)}
        </p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-xl bg-destructive/10 px-3 py-2"
        >
          <p className="font-body text-xs text-destructive">
            {t('access.methods.error', lang)}
          </p>
          <Button
            type="button"
            variant="bubbleLink"
            onClick={onRetry}
            className="min-h-9 text-xs underline"
          >
            {t('access.methods.retry', lang)}
          </Button>
        </div>
      )}

      {!loading && !error && methods && (
        <ul className="flex flex-col gap-2">
          <li className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-km0-blue-700/10 bg-background px-3 py-2">
            <Mail
              aria-hidden
              size={18}
              className="shrink-0 text-km0-blue-700"
            />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-ui text-sm text-km0-blue-800">
                {t('access.methods.email', lang)}
                {methods.createdWith === 'email' && <FirstBadge lang={lang} />}
              </p>
              <p className="break-all font-body text-xs text-muted-foreground">
                {methods.email.address}
              </p>
              <p className="whitespace-normal font-body text-xs text-muted-foreground">
                {tf('access.methods.linked_on', lang, {
                  date: formatDate(methods.email.linkedAt, lang),
                })}
              </p>
            </div>
          </li>
          {rows.map((provider) => {
            const linked = linkedProviders.find((p) => p.provider === provider)
            const network = networkName(provider, lang)
            return (
              <li
                key={provider}
                data-provider={provider}
                className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-km0-blue-700/10 bg-background px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-ui text-sm text-km0-blue-800">
                    {network}
                    {methods.createdWith === provider && (
                      <FirstBadge lang={lang} />
                    )}
                  </p>
                  {linked && (
                    <p className="font-body text-xs text-muted-foreground">
                      {tf('access.methods.linked_on', lang, {
                        date: formatDate(linked.linkedAt, lang),
                      })}
                    </p>
                  )}
                </div>
                {!linked && (
                  <Button
                    type="button"
                    variant="bubbleTertiary"
                    onClick={() => openSheet(provider)}
                    aria-haspopup="dialog"
                    aria-label={tf('access.methods.add_aria', lang, {
                      network,
                    })}
                    className="min-h-10 px-4 text-sm"
                  >
                    {t('access.methods.add', lang)}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!loading && !error && methods && linkedProviders.length === 0 && (
        <p className="px-1 font-body text-xs text-muted-foreground">
          {t('access.methods.empty', lang)}
        </p>
      )}
      {linkedNotice && (
        <SocialNotice notice={{ tone: 'success', message: linkedNotice }} />
      )}

      {linking && (
        <BubbleSheet
          open
          onClose={closeSheet}
          lang={lang}
          title={tf('access.methods.sheet_title', lang, {
            network: networkName(linking, lang),
          })}
        >
          <div className="flex flex-col gap-3">
            <p className="font-body text-sm text-muted-foreground">
              {tf('access.methods.sheet_description', lang, {
                network: networkName(linking, lang),
              })}
            </p>
            <SocialSignInButton
              provider={linking}
              label={tf('access.social.continue', lang, {
                network: networkName(linking, lang),
              })}
              loading={busy}
              disabled={false}
              onClick={() => link(linking)}
            />
            {sheetNotice && <SocialNotice notice={sheetNotice} />}
          </div>
        </BubbleSheet>
      )}
    </section>
  )
}

export default SignInMethodsSection
