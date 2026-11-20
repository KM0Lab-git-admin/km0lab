import type { AccountAccessTarget } from '@km0lab/app'
import { t, type Lang } from '@km0lab/app'
import { Button, Input, Label } from '@km0lab/ui'
import { Lock, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import BubbleSheet from '@/components/BubbleSheet'

interface AccountAccessSheetProps {
  target: AccountAccessTarget | null
  lang: Lang
  container: HTMLElement | null
  submitting: boolean
  error: string | null
  onClose: () => void
  onContinue: (email: string) => void
  onLogin: () => void
}

const AccountAccessSheet = ({
  target,
  lang,
  container,
  submitting,
  error,
  onClose,
  onContinue,
  onLogin,
}: AccountAccessSheetProps) => {
  const [email, setEmail] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email.trim() && !submitting) onContinue(email.trim())
  }
  return (
    <BubbleSheet
      open={target !== null}
      onClose={onClose}
      title={t('account.sheet.title', lang)}
      lang={lang}
      container={container}
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-3 rounded-2xl bg-km0-teal-100 p-4 font-ui text-sm font-bold text-km0-teal-800">
          <Lock aria-hidden className="h-5 w-5 shrink-0" />
          {t(
            target === 'profile'
              ? 'account.sheet.profile'
              : target === 'rewards'
                ? 'account.sheet.rewards'
                : 'account.sheet.points',
            lang
          )}
        </p>
        <p className="font-body text-sm text-km0-blue-700/70">
          {t('account.sheet.hint', lang)}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Label
            htmlFor="account-email"
            className="font-ui font-bold text-km0-blue-800"
          >
            {t('account.sheet.email', lang)}
          </Label>
          <Input
            id="account-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('login.email_placeholder', lang)}
            className="h-14 rounded-2xl border-2 border-km0-blue-700 bg-card px-4 text-base text-km0-blue-800"
          />
          {error && (
            <p role="alert" className="font-ui text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            variant="bubblePrimary"
            type="submit"
            disabled={submitting || !email.trim()}
            className="mt-2 w-full"
          >
            {submitting && <Loader2 aria-hidden className="animate-spin" />}
            {t(
              submitting ? 'login.submitting' : 'account.sheet.continue',
              lang
            )}
          </Button>
        </form>
        <Button
          variant="bubbleLink"
          onClick={onLogin}
          disabled={submitting}
          className="h-auto whitespace-normal text-center underline underline-offset-4"
        >
          {t('account.sheet.login', lang)}
        </Button>
        <p className="font-body text-xs text-km0-blue-700/70">
          {t('account.sheet.demo', lang)}
        </p>
      </div>
    </BubbleSheet>
  )
}

export default AccountAccessSheet
