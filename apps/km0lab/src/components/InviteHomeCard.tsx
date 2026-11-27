import { useInviteRewards, t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { InvitationsSummary } from '@km0lab/app'

import ShareChannelsSheet from '@/components/ShareChannelsSheet'
import { useLang } from '@/contexts/LangContext'

interface InviteHomeCardProps {
  isAuthed: boolean
  onInvite: () => void
  onLogin: () => void
  onCreateAccount: () => void
  onViewInvitations: () => void
  invitationSummary: InvitationsSummary | null
}

const InviteHomeCard = ({
  isAuthed,
  onInvite,
  onLogin,
  onCreateAccount,
  onViewInvitations,
  invitationSummary,
}: InviteHomeCardProps) => {
  const { lang } = useLang()
  const inviteRewards = useInviteRewards()
  const [searchParams] = useSearchParams()
  // Al volver del acceso conservamos el contexto: ?share=1 reabre el panel.
  const [shareOpen, setShareOpen] = useState(
    () => searchParams.get('share') === '1'
  )

  return (
    <section className="rounded-3xl bg-card p-4 shadow-[var(--shadow-bubble)]">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-km0-teal-100 text-km0-teal-700">
          <Share2 aria-hidden size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-brand text-lg font-black text-km0-blue-900">
            {t(isAuthed ? 'invite.home.title' : 'share.title', lang)}
          </h2>
          <p className="mt-1 font-ui text-sm leading-snug text-km0-blue-800/70">
            {t(
              isAuthed
                ? 'invite.home.description_authed'
                : 'share.home.description',
              lang
            )}
          </p>
        </div>
      </div>

      {isAuthed ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-lg bg-km0-yellow-100 px-2 py-1.5 text-center font-ui text-xs font-bold text-km0-blue-900">
              {t('invite.person.short', lang)} · +{inviteRewards.person}{' '}
              {t('common.points', lang)}
            </span>
            <span className="rounded-lg bg-km0-teal-100 px-2 py-1.5 text-center font-ui text-xs font-bold text-km0-blue-900">
              {t('invite.business.short', lang)} · +{inviteRewards.business}{' '}
              {t('common.points', lang)}
            </span>
          </div>
          {invitationSummary &&
          (invitationSummary.personsRegistered > 0 ||
            invitationSummary.businessesRegistered > 0) ? (
            <p className="mt-3 rounded-lg bg-km0-beige-100 px-3 py-2 text-center font-ui text-sm leading-snug text-km0-blue-800/75">
              {t(
                invitationSummary.personsRegistered === 1
                  ? 'invites.compact.person.one'
                  : 'invites.compact.person.other',
                lang
              ).replace(
                '{count}',
                String(invitationSummary.personsRegistered)
              )}{' '}
              {t('invites.compact.and', lang)}{' '}
              {t(
                invitationSummary.businessesRegistered === 1
                  ? 'invites.compact.business.one'
                  : 'invites.compact.business.other',
                lang
              ).replace(
                '{count}',
                String(invitationSummary.businessesRegistered)
              )}{' '}
              · {invitationSummary.pointsEarned}{' '}
              {t('invites.compact.points', lang)}
            </p>
          ) : null}
          <Button
            type="button"
            variant="bubblePrimary"
            onClick={onInvite}
            className="mt-3 w-full"
          >
            {t('invite.home.cta', lang)}
          </Button>
          <Button
            type="button"
            variant="bubbleSecondary"
            onClick={onViewInvitations}
            className="mt-2 w-full"
          >
            {t('invites.link', lang)}
          </Button>
          <p className="mt-2 text-center font-body text-xs text-km0-blue-800/60">
            {t('invite.home.note', lang)}
          </p>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="bubbleSecondary"
            onClick={() => setShareOpen(true)}
            className="mt-3 w-full"
          >
            <Share2 aria-hidden />
            {t('share.cta', lang)}
          </Button>
          <p className="mt-3 font-body text-xs text-km0-blue-800/60">
            {t('share.points_question', lang)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button
              variant="bubbleLink"
              type="button"
              onClick={onCreateAccount}
              className="px-0 text-sm underline underline-offset-2"
            >
              {t('share.create_account', lang)}
            </Button>
            <Button
              variant="bubbleLink"
              type="button"
              onClick={onLogin}
              className="px-0 text-sm underline underline-offset-2"
            >
              {t('share.login', lang)}
            </Button>
          </div>
          <ShareChannelsSheet
            open={shareOpen}
            onOpenChange={setShareOpen}
            returnTo="/home?share=1"
          />
        </>
      )}
    </section>
  )
}

export default InviteHomeCard
