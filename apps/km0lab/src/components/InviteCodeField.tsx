import { Button } from '@km0lab/ui'
import { useId, useState } from 'react'

/*
 * Copia de `src/components/InviteCodeField.tsx` de Lovable (encargo 13,
 * commit 01c3db5), con los imports de producción. Tiene candado en el
 * manifest porque solo la usa `Login`, que es de producción: el porte no
 * sigue los imports de una pantalla con candado y la daría por huérfana.
 */
export interface InviteCodeFieldProps {
  value: string
  onChange: (value: string) => void
  /** Starts expanded, e.g. when the link already carries an invitation code. */
  initiallyOpen: boolean
  toggleLabel: string
  label: string
}

/** Optional invitation code for sign-up; validation belongs to the server. */
const InviteCodeField = ({
  value,
  onChange,
  initiallyOpen,
  toggleLabel,
  label,
}: InviteCodeFieldProps) => {
  const [open, setOpen] = useState(initiallyOpen)
  const inputId = useId()

  if (!open) {
    return (
      <Button
        type="button"
        variant="bubbleLink"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="self-start px-0 text-xs underline underline-offset-2"
      >
        {toggleLabel}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="px-1 font-ui text-xs font-bold text-km0-blue-800"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="h-11 rounded-xl border-2 border-km0-blue-700/20 bg-background px-4 font-body text-base text-foreground focus:border-km0-blue-700 focus:outline-none transition-colors"
      />
    </div>
  )
}

export default InviteCodeField
