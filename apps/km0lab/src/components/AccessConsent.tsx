import { t, type Lang } from '@km0lab/app'
import { Checkbox } from '@km0lab/ui'
import { useId, type RefObject } from 'react'

import { cn } from '@/lib/utils'

interface AccessConsentProps {
  lang: Lang
  accepted: boolean
  onChange: (accepted: boolean) => void
  termsHref: string
  privacyHref: string
  error: boolean
  checkboxRef: RefObject<HTMLButtonElement | null>
}
const AccessConsent = ({
  lang,
  accepted,
  onChange,
  termsHref,
  privacyHref,
  error,
  checkboxRef,
}: AccessConsentProps) => {
  const id = useId()
  const errorId = useId()
  const [before, after = ''] = t('access.terms.checkbox', lang).split('{terms}')
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl p-2',
        error && 'bg-destructive/10 ring-2 ring-destructive'
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          ref={checkboxRef}
          id={id}
          checked={accepted}
          onCheckedChange={(value) => onChange(value === true)}
          aria-invalid={error}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-km0-blue-700"
        />
        <label
          htmlFor={id}
          className="font-body text-sm leading-snug text-km0-blue-800"
        >
          {before}
          <a
            href={termsHref}
            target="_blank"
            rel="noopener"
            className="font-bold underline underline-offset-2"
          >
            {t('access.terms.link', lang)}
          </a>
          {after}
        </label>
      </div>
      <p className="font-body text-[11px] leading-snug text-muted-foreground">
        {t('access.terms.small', lang)}
        <a
          href={privacyHref}
          target="_blank"
          rel="noopener"
          className="font-bold underline underline-offset-2"
        >
          {t('access.terms.privacy_link', lang)}
        </a>
        {t('access.terms.privacy_after', lang)}
      </p>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-ui text-xs font-bold text-destructive"
        >
          {t('access.terms.error', lang)}
        </p>
      )}
    </div>
  )
}
export default AccessConsent
