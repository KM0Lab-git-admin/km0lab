import { useRef, useState } from 'react'

export const useAccessConsent = (accepted: boolean) => {
  const [error, setError] = useState(false)
  const checkboxRef = useRef<HTMLButtonElement>(null)
  const guard = (action: () => void) => () => {
    if (!accepted) {
      setError(true)
      checkboxRef.current?.focus()
      return
    }
    action()
  }
  return {
    error: error && !accepted,
    checkboxRef,
    guard,
    clearError: () => setError(false),
  }
}
