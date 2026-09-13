import { requestOtp, verifyOtp, t } from '@km0lab/app'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Navigate,
} from 'react-router-dom'
import { toast } from 'sonner'

import type { KeyboardEvent, ClipboardEvent } from 'react'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'

const RESEND_COOLDOWN_SECONDS = 30
const CODE_LENGTH = 6

interface LocationState {
  email?: string
  mode?: 'signup' | 'login'
}

/**
 * CheckEmail — Entrada de código OTP de 6 dígitos enviado por email.
 */
const CheckEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = (location.state ?? {}) as LocationState
  const email = state.email ?? searchParams.get('email') ?? undefined
  const { lang } = useLang()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  if (!email) {
    return <Navigate to="/login" replace />
  }

  const verify = async (code: string) => {
    if (verifying) return
    setVerifying(true)
    const { error } = await verifyOtp(email, code)
    if (error) {
      toast.error(t('otp.toast_wrong', lang))
      setDigits(Array(CODE_LENGTH).fill(''))
      inputsRef.current[0]?.focus()
      setVerifying(false)
      return
    }
    toast.success(t('otp.welcome', lang))
    navigate('/home?welcome=1', { replace: true })
  }

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = clean
    setDigits(next)
    if (clean && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
    if (next.every((d) => d !== '')) {
      verify(next.join(''))
    }
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const lastIdx = Math.min(pasted.length, CODE_LENGTH) - 1
    inputsRef.current[lastIdx]?.focus()
    if (pasted.length === CODE_LENGTH) verify(pasted)
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    const { error } = await requestOtp(email)
    setResending(false)
    if (error) {
      toast.error(t('otp.toast_resend_fail', lang))
      return
    }
    toast.success(t('otp.toast_resent', lang))
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <BrandedFrame
      onBack={() => navigate(-1)}
      backAriaLabel={t('common.back', lang)}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-full flex flex-col items-center justify-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-km0-yellow-500/20 flex items-center justify-center mt-2">
          <Mail className="w-7 h-7 text-km0-blue-700" />
        </div>

        <div className="text-center space-y-1 px-2">
          <h1 className="font-brand text-2xl text-km0-blue-700">
            {t('otp.title', lang)}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {t('otp.subtitle', lang)}
          </p>
          <p className="font-ui text-base text-foreground break-all">{email}</p>
        </div>

        <div className="flex gap-2 mt-1" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={d}
              disabled={verifying}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center font-ui text-xl rounded-xl border-2 border-km0-blue-700/20 bg-background text-foreground focus:outline-none focus:border-km0-blue-700 transition-colors disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="font-body text-sm text-km0-blue-700 underline underline-offset-2 disabled:text-muted-foreground disabled:no-underline mt-1"
        >
          {resending
            ? t('otp.resending', lang)
            : cooldown > 0
              ? `${t('otp.resend_in', lang)} ${cooldown}s`
              : t('otp.resend', lang)}
        </button>

        <p className="font-body text-xs text-muted-foreground text-center px-4">
          {t('otp.footer_hint', lang)}
        </p>
      </motion.div>
    </BrandedFrame>
  )
}

export default CheckEmail
