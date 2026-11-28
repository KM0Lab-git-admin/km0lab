import {
  acceptTerms,
  fetchTermsPending,
  t,
  useAppStore,
  type Lang,
} from '@km0lab/app'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { LegalLine } from '@/components/LegalText'
import { useLang } from '@/contexts/LangContext'

/*
 * «Antes de continuar» — de producción (candado en el manifest).
 *
 * Quien ya tenía cuenta cuando se publicaron las condiciones del piloto no
 * las ha aceptado. Al entrar, si el servidor dice que le falta la versión
 * vigente, esta pantalla tapa la App hasta que marca la casilla y continúa.
 * Sale una vez: aceptar deja apuntada la versión y la fecha en su cuenta.
 *
 * Textos de Legal (consentimiento-alta.md, apartado 2): la misma casilla y
 * la misma letra pequeña del alta. Las dos páginas legales se pueden leer
 * sin aceptar: en ellas la pantalla se aparta.
 *
 * Si no se puede preguntar al servidor (sin red), no se enseña: nadie se
 * queda fuera de la App por un fallo de conexión.
 */
const LEGAL_PATHS = ['/condicions', '/privacitat']

const MAIL_SUBJECT: Record<Lang, string> = {
  ca: 'Baixa',
  es: 'Baja',
  en: 'Delete account',
}

export default function TermsGate() {
  const { lang } = useLang()
  const { pathname } = useLocation()
  const token = useAppStore((s) => s.token)
  const userId = useAppStore((s) => s.session?.user.id ?? null)
  const queryClient = useQueryClient()
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  const queryKey = ['terms-pending', userId]
  const { data: pending } = useQuery({
    queryKey,
    queryFn: fetchTermsPending,
    enabled: Boolean(token && userId),
    staleTime: Infinity,
    retry: false,
  })

  if (!token || !userId || !pending) return null
  if (LEGAL_PATHS.includes(pathname)) return null

  const submit = async () => {
    if (!accepted || saving) return
    setSaving(true)
    setFailed(false)
    const result = await acceptTerms()
    setSaving(false)
    // `not_recorded`: un servidor más antiguo que la App. No se deja a nadie
    // detrás de esta pantalla por eso; volverá a salir cuando toque.
    if (result !== 'failed') {
      queryClient.setQueryData(queryKey, false)
      setAccepted(false)
    } else {
      setFailed(true)
    }
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
      aria-describedby="terms-gate-body"
      className="fixed inset-0 z-[900] overflow-y-auto bg-background"
    >
      <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-5 px-6 py-10">
        <h1
          id="terms-gate-title"
          className="font-brand text-2xl text-km0-blue-700"
        >
          {t('legal.gate.title', lang)}
        </h1>
        <p id="terms-gate-body" className="font-body text-base text-foreground">
          {t('legal.gate.body', lang)}
        </p>

        <label className="flex items-start gap-2.5 text-left font-body text-sm text-foreground">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-km0-blue-700"
          />
          <span>
            <LegalLine text={t('legal.accept.label', lang)} />
          </span>
        </label>
        <p className="font-body text-xs italic leading-relaxed text-muted-foreground">
          <LegalLine text={t('legal.accept.info', lang)} />
        </p>

        {failed && (
          <p role="alert" className="font-body text-sm text-destructive">
            {t('legal.gate.error', lang)}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!accepted || saving}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-ui text-base font-semibold text-primary-foreground transition-all hover:bg-km0-blue-600 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 aria-hidden size={18} className="animate-spin" />
          ) : null}
          {t('legal.gate.cta', lang)}
        </button>

        <a
          href={`mailto:info@km0lab.com?subject=${encodeURIComponent(MAIL_SUBJECT[lang])}`}
          className="text-center font-body text-xs text-muted-foreground underline underline-offset-2"
        >
          {t('legal.gate.leave', lang)}
        </a>
      </div>
    </div>
  )
}
