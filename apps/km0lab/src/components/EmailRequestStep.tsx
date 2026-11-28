import { Input, Label, Button } from '@km0lab/ui'
import { useId, type FormEvent, type ReactNode } from 'react'

interface EmailRequestStepProps {
  title: string
  reason: string
  emailLabel: string
  placeholder: string
  backLabel: string
  email: string
  error: string | null
  submitting: boolean
  formId?: string
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onBack: () => void
  /** The host places the submit control here or in its fixed sheet footer. */
  children?: ReactNode
}

const EmailRequestStep = ({
  title,
  reason,
  emailLabel,
  placeholder,
  backLabel,
  email,
  error,
  submitting,
  formId,
  onEmailChange,
  onSubmit,
  onBack,
  children,
}: EmailRequestStepProps) => {
  const id = useId()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submitting) onSubmit()
  }
  return (
    <form
      id={formId}
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-3"
    >
      <div className="space-y-1">
        <h2 className="font-brand text-xl text-km0-blue-800">{title}</h2>
        <p className="font-body text-xs leading-5 text-km0-blue-800/70">
          {reason}
        </p>
      </div>
      <Label
        htmlFor={`${id}-email`}
        className="font-ui text-sm text-km0-blue-800"
      >
        {emailLabel}
      </Label>
      <Input
        id={`${id}-email`}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={placeholder}
        value={email}
        disabled={submitting}
        onChange={(event) => onEmailChange(event.target.value)}
        onFocus={(event) =>
          event.currentTarget.scrollIntoView({ block: 'center' })
        }
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 shrink-0 rounded-xl border-2 border-km0-blue-700/20 bg-card px-4 font-body text-base text-km0-blue-800"
      />
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-body text-xs text-destructive"
        >
          {error}
        </p>
      )}
      {children}
      <Button
        type="button"
        variant="bubbleLink"
        onClick={onBack}
        disabled={submitting}
        className="self-center text-sm underline underline-offset-2"
      >
        {backLabel}
      </Button>
    </form>
  )
}
export default EmailRequestStep
