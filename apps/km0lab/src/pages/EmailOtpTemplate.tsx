import { t } from '@km0lab/app'
import { useSearchParams } from 'react-router-dom'

import Km0Logo from '@/components/Km0Logo'
import { useLang } from '@/contexts/LangContext'

const DEFAULT_CODE = '660111'
const DEFAULT_MINUTES = 10

/**
 * EmailOtpTemplate — Maqueta (presentacional) del correo que recibe el
 * usuario con el código de 6 dígitos para acceder o recuperar la sesión.
 *
 * Query params (solo para previsualizar estados):
 *   ?code=123456&minutes=10&email=hola%40km0lab.com
 */
const EmailOtpTemplate = () => {
  const { lang } = useLang()
  const [params] = useSearchParams()

  const rawCode = (params.get('code') ?? DEFAULT_CODE)
    .replace(/\D/g, '')
    .slice(0, 6)
  const code = rawCode.padEnd(6, '0')
  const parsedMinutes = Number(params.get('minutes'))
  const minutes =
    Number.isFinite(parsedMinutes) && parsedMinutes > 0
      ? parsedMinutes
      : DEFAULT_MINUTES
  const email = params.get('email')

  return (
    <main className="min-h-screen w-full bg-km0-beige-100 flex items-start justify-center px-4 py-8 overflow-x-hidden">
      <article className="w-full max-w-[480px] rounded-2xl bg-background shadow-lg overflow-hidden">
        <header className="bg-km0-blue-700 px-6 py-5 flex justify-center">
          <Km0Logo className="h-7 w-auto" />
        </header>

        <div className="px-6 py-7 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-brand text-2xl text-km0-blue-700">
              {t('email_otp.title', lang)}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t('email_otp.intro', lang)}
            </p>
            {email && (
              <p className="font-ui text-sm text-foreground break-all">
                {email}
              </p>
            )}
          </div>

          <div className="rounded-2xl border-2 border-km0-blue-700/15 bg-km0-beige-100/60 px-4 py-5 flex flex-col items-center gap-3">
            <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">
              {t('email_otp.code_label', lang)}
            </span>
            <div className="flex gap-2">
              {code.split('').map((digit, i) => (
                <span
                  key={i}
                  className="w-9 h-11 rounded-lg bg-background border border-km0-blue-700/20 flex items-center justify-center font-ui text-xl font-bold text-km0-blue-700"
                >
                  {digit}
                </span>
              ))}
            </div>
            <span className="font-body text-sm text-km0-coral-400 font-bold text-center">
              {t('email_otp.validity', lang).replace(
                '{minutes}',
                String(minutes)
              )}
            </span>
          </div>

          <p className="font-body text-sm text-muted-foreground">
            {t('email_otp.security', lang)}
          </p>
        </div>

        <footer className="border-t border-border px-6 py-4 flex flex-col gap-1">
          <p className="font-body text-xs text-muted-foreground text-center">
            {t('email_otp.footer_hint', lang)}
          </p>
          <p className="font-body text-xs text-muted-foreground text-center">
            {t('email_otp.footer_signature', lang)}
          </p>
        </footer>
      </article>
    </main>
  )
}

export default EmailOtpTemplate
