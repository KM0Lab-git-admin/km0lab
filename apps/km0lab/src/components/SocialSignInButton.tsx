import { Button } from '@km0lab/ui'
import { Loader2 } from 'lucide-react'

import type { AccessProvider } from '@km0lab/app'

import appleLogo from '@/assets/apple-logo-white.svg'
import facebookLogo from '@/assets/facebook-logo-white.svg'
import googleLogo from '@/assets/google-logo.svg'
import { cn } from '@/lib/utils'

export interface SocialSignInButtonProps {
  provider: AccessProvider
  label: string
  loading: boolean
  disabled: boolean
  /** Looks unavailable but stays focusable and clickable, so the caller can explain why. */
  ariaDisabled?: boolean
  onClick: () => void
}

/** Official brand treatment per network; colours come from the brand tokens in index.css. */
const BRAND: Record<
  AccessProvider,
  { logo: string; button: string; logoClass: string; text: string }
> = {
  google: {
    logo: googleLogo,
    button:
      'border border-[hsl(var(--brand-google-border))] bg-[hsl(var(--brand-google-surface))] text-[hsl(var(--brand-google-text))]',
    logoClass: '-left-px h-10 w-10',
    text: 'font-[family-name:var(--brand-google-font)] text-sm leading-5',
  },
  facebook: {
    logo: facebookLogo,
    button:
      'bg-[hsl(var(--brand-facebook))] text-[hsl(var(--brand-network-text))]',
    logoClass: 'left-1 h-8 w-8',
    text: 'text-sm leading-5',
  },
  apple: {
    logo: appleLogo,
    button:
      'bg-[hsl(var(--brand-apple))] text-[hsl(var(--brand-network-text))]',
    logoClass: 'left-0 h-full w-auto',
    text: 'text-[length:var(--brand-apple-font-size)] leading-5',
  },
}

const SocialSignInButton = ({
  provider,
  label,
  loading,
  disabled,
  ariaDisabled = false,
  onClick,
}: SocialSignInButtonProps) => {
  const brand = BRAND[provider]
  return (
    <Button
      type="button"
      variant="bubbleSurface"
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={ariaDisabled || undefined}
      aria-busy={loading || undefined}
      data-provider={provider}
      className={cn(
        'relative h-10 w-full shrink-0 overflow-hidden rounded-[var(--brand-signin-radius)] px-11 font-ui font-medium disabled:opacity-60',
        brand.button,
        brand.text,
        ariaDisabled && 'opacity-50'
      )}
    >
      {loading ? (
        <Loader2 aria-hidden className="absolute left-3 h-5 w-5 animate-spin" />
      ) : (
        <img
          src={brand.logo}
          alt=""
          aria-hidden="true"
          className={cn('absolute top-1/2 -translate-y-1/2', brand.logoClass)}
        />
      )}
      <span className="truncate">{label}</span>
    </Button>
  )
}

export interface SocialNoticeValue {
  message: string
  tone: 'error' | 'success'
  action?: { label: string; onClick: () => void }
}

/** Semantic message under the network buttons (failure, missing email, offline, linked). */
export const SocialNotice = ({ notice }: { notice: SocialNoticeValue }) => (
  <div
    role={notice.tone === 'error' ? 'alert' : 'status'}
    className={cn(
      'flex flex-col gap-1 rounded-xl px-3 py-2 font-body text-xs leading-snug',
      notice.tone === 'error'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-km0-teal-100 text-km0-teal-700'
    )}
  >
    <p>{notice.message}</p>
    {notice.action && (
      <Button
        type="button"
        variant="bubbleLink"
        onClick={notice.action.onClick}
        className="min-h-9 self-start px-0 text-xs underline underline-offset-2"
      >
        {notice.action.label}
      </Button>
    )}
  </div>
)

export default SocialSignInButton
