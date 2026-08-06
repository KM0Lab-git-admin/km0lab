import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { requestOtp, t, useAppStore } from '@km0lab/app'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'

/**
 * Pantalla única de entrada (login + registro unificados).
 *
 * Flujo passwordless OTP de 4 dígitos. Recupera CP/población de
 * localStorage (escritos en /postal-code) y los adjunta al
 * user_metadata para que el trigger handle_new_user pueble profiles.
 */
const Login = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error(t('login.error_email', lang))
      return
    }

    setSubmitting(true)
    const { postalCode, town } = useAppStore.getState()
    const { error } = await requestOtp(email.trim(), {
      postal_code: postalCode ?? undefined,
      town: town ?? undefined,
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    toast.success(t('login.toast_sent', lang))
    navigate('/check-email', { state: { email: email.trim(), mode: 'login' } })
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
        className="min-h-full flex flex-col justify-center gap-4"
      >
        <div className="flex flex-col gap-3 min-w-0">
          <div className="text-center space-y-1 mt-2">
            <h1 className="font-brand text-2xl text-km0-blue-700">
              {t('login.title', lang)}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t('login.subtitle', lang)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.email_placeholder', lang)}
              autoComplete="email"
              inputMode="email"
              className="h-12 px-4 rounded-xl border-2 border-km0-blue-700/20 bg-background font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-km0-blue-700 transition-colors"
            />

            <button
              type="submit"
              disabled={submitting}
              className="h-12 mt-1 rounded-xl bg-km0-yellow-500 hover:bg-km0-yellow-600 active:scale-[0.98] transition-all font-ui text-base text-km0-blue-700 disabled:opacity-50"
            >
              {submitting
                ? t('login.submitting', lang)
                : t('login.submit', lang)}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-km0-blue-700/15" />
            <span className="font-body text-xs text-muted-foreground">
              {t('login.divider', lang)}
            </span>
            <div className="flex-1 h-px bg-km0-blue-700/15" />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full" aria-disabled="true">
            <button
              type="button"
              disabled
              title={t('login.divider', lang)}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-km0-blue-700/10 bg-muted/40 grayscale opacity-50 cursor-not-allowed font-ui text-sm text-muted-foreground"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              disabled
              title={t('login.divider', lang)}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-km0-blue-700/10 bg-muted/40 grayscale opacity-50 cursor-not-allowed font-ui text-sm text-muted-foreground"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.05 12.04c-.03-3.16 2.58-4.68 2.7-4.75-1.47-2.15-3.76-2.45-4.57-2.48-1.95-.2-3.8 1.15-4.79 1.15-.99 0-2.51-1.12-4.13-1.09-2.13.03-4.09 1.24-5.18 3.14-2.21 3.83-.57 9.5 1.59 12.6 1.05 1.52 2.31 3.23 3.97 3.17 1.59-.06 2.19-1.03 4.11-1.03s2.46 1.03 4.15 1c1.71-.03 2.79-1.55 3.84-3.07 1.21-1.76 1.71-3.47 1.74-3.56-.04-.02-3.34-1.28-3.37-5.08zM14.13 3.66c.88-1.07 1.47-2.55 1.31-4.03-1.27.05-2.79.84-3.7 1.91-.81.94-1.52 2.45-1.33 3.9 1.41.11 2.85-.72 3.72-1.78z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>
      </motion.div>
    </BrandedFrame>
  )
}

export default Login
