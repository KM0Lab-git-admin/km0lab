import { t, type TKey } from '@km0lab/app'
import { scannerMachine, useAppStore } from '@km0lab/app'
import { useMachine } from '@xstate/react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  Loader2,
  ScanLine,
  WifiOff,
  X,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ScanErrorKind } from '@km0lab/app'

import BrandedFrame from '@/components/BrandedFrame'
import Km0Logo from '@/components/Km0Logo'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * Scanner — Escàner global de QR (mock).
 *
 * Presentacional: la lògica del flux viu a `scannerMachine` (XState).
 * NO llegeix cap càmera real; el visor és un placeholder animat i el
 * disparador de "detecció" és un panell de simulació visible només a
 * preview per demostrar els quatre estats (lectura / validació / error /
 * èxit).
 *
 * Maquetació dins de `BrandedFrame` amb el Design System KM0: card beix,
 * visor fosc amb esquines `km0-teal`, accent inferior `km0-teal` i
 * jerarquia tipogràfica de marca.
 */

const ERROR_ICONS: Record<ScanErrorKind, typeof AlertTriangle> = {
  ja_visitat: Check,
  codi_no_valid: AlertTriangle,
  qr_caducat: AlertTriangle,
  sense_connexio: WifiOff,
}

const format = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

const Scanner = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [state, send] = useMachine(scannerMachine)

  const session = useAppStore((s) => s.session)
  const profiles = useAppStore((s) => s.profiles)
  const userFirstName = useMemo(() => {
    if (!session) return ''
    return profiles[session.user.id]?.first_name ?? ''
  }, [session, profiles])

  const status = state.value as 'reading' | 'validating' | 'error' | 'success'

  // ── ÈXIT → navega a la pantalla de Confirmació ────────────
  useEffect(() => {
    if (status !== 'success' || !state.context.result?.ok) return
    const r = state.context.result
    const timer = window.setTimeout(() => {
      navigate('/scanner/success', {
        state: {
          comercId: r.comercId,
          comercNom: r.comercNom,
          puntsGuanyats: r.puntsGuanyats,
          totalPunts: r.totalPunts,
          nivell: r.nivell,
        },
      })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [status, state.context.result, navigate])

  const close = () => navigate('/comercos')

  const simulate = (code: string) => send({ type: 'DETECT', code })
  const retry = () => send({ type: 'RESET' })

  return (
    <BrandedFrame
      hideHeader
      portraitContentClassName="relative p-0 overflow-hidden"
      landscapeContentClassName="relative p-0 overflow-hidden"
    >
      {/* Header ── cierre + logo ─────────────────────────── */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-4 pt-5 pb-3">
        <button
          type="button"
          onClick={close}
          aria-label={t('scanner.close', lang)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-km0-blue-900/5 text-km0-blue-900 hover:bg-km0-blue-900/10 transition-colors"
        >
          <X size={20} strokeWidth={2.4} />
        </button>
        <Km0Logo className="h-7 w-auto" />
        <div className="w-10" aria-hidden="true" />
      </header>

      {/* Títol ── marca + hint ─────────────────────────── */}
      <div className="shrink-0 px-6 pb-4">
        <h1 className="font-brand text-2xl text-km0-blue-900">
          {t('scanner.title', lang)}
        </h1>
        <p className="mt-1 font-body text-sm text-km0-blue-900/70">
          {t('scanner.hint', lang)}
        </p>
      </div>

      {/* Visor ── àrea fosca amb esquines teal ─────────── */}
      <div className="relative flex-1 min-h-0 mx-6 mb-4 rounded-3xl overflow-hidden bg-gradient-to-b from-km0-blue-800 to-km0-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-km0-blue-700/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-[260px]">
            <div className="absolute inset-0 rounded-2xl bg-km0-blue-900/20 backdrop-blur-[1px]" />

            {/* Esquines */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
            ].map((pos) => (
              <span
                key={pos}
                className={cn('absolute w-10 h-10 border-km0-teal-400', pos)}
              />
            ))}

            {/* Línia d'escaneig animada (només durant lectura) */}
            {status === 'reading' && (
              <motion.div
                aria-hidden
                className="absolute left-3 right-3 h-[2px] rounded-full bg-km0-teal-400 shadow-[0_0_12px_hsl(var(--km0-teal-400))]"
                initial={{ top: '12%' }}
                animate={{ top: ['12%', '88%', '12%'] }}
                transition={{
                  duration: 2.4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            )}
          </div>
        </div>

        {/* Overlay VALIDANT */}
        {status === 'validating' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-km0-blue-900/60 backdrop-blur-sm">
            <Loader2 size={40} className="animate-spin text-km0-teal-400" />
            <p className="text-sm font-ui font-semibold text-km0-beige-50">
              {t('scanner.validating.title', lang)}
            </p>
          </div>
        )}
      </div>

      {/* Footer ── estatus + simulació ─────────────────── */}
      <footer className="shrink-0 px-6 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-km0-blue-900 px-4 py-2 text-km0-beige-50 text-xs font-ui">
          <ScanLine size={14} strokeWidth={2.2} />
          {t('scanner.footer', lang)}
        </div>

        {/* Panell de simulació (només preview) */}
        {status === 'reading' && (
          <div className="mt-4 rounded-2xl border border-km0-beige-200 bg-card p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-km0-blue-900/50 mb-2 text-center">
              {t('scanner.debug.title', lang)}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => simulate('OK_FORN_ROVIRA')}
                className="col-span-2 rounded-lg bg-km0-yellow-400 text-km0-blue-900 font-ui font-bold text-xs py-2 hover:bg-km0-yellow-300 transition-colors"
              >
                {t('scanner.debug.ok', lang)}
              </button>
              {(
                [
                  ['ERR_JA_VISITAT', 'scanner.debug.ja_visitat'],
                  ['ERR_CODI', 'scanner.debug.codi_no_valid'],
                  ['ERR_CADUCAT', 'scanner.debug.qr_caducat'],
                  ['ERR_CONNEXIO', 'scanner.debug.sense_connexio'],
                ] as const
              ).map(([code, key]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => simulate(code)}
                  className="rounded-lg bg-km0-blue-900 hover:bg-km0-blue-800 text-km0-beige-50 font-ui text-xs py-2 transition-colors"
                >
                  {t(key as TKey, lang)}
                </button>
              ))}
            </div>
          </div>
        )}
      </footer>

      {/* Accent inferior de marca */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-km0-teal-500" />

      {/* ── ERROR overlay ─────────────────────────────── */}
      {status === 'error' && state.context.errorKind && (
        <ErrorOverlay
          kind={state.context.errorKind}
          comercNom={state.context.errorComercNom ?? undefined}
          onRetry={retry}
          onPromos={() =>
            navigate('/comercos', { state: { openPromos: true } })
          }
        />
      )}

      {/* ── SUCCESS mini-confirmació ─────────────────── */}
      {status === 'success' && state.context.result?.ok && (
        <SuccessOverlay
          userName={userFirstName}
          comercNom={state.context.result.comercNom}
          puntsGuanyats={state.context.result.puntsGuanyats}
          totalPunts={state.context.result.totalPunts}
        />
      )}
    </BrandedFrame>
  )
}

// ══ Sub-componentes ═════════════════════════════════════════

interface ErrorOverlayProps {
  kind: ScanErrorKind
  comercNom?: string
  onRetry: () => void
  onPromos: () => void
}

const ErrorOverlay = ({
  kind,
  comercNom,
  onRetry,
  onPromos,
}: ErrorOverlayProps) => {
  const { lang } = useLang()
  const Icon = ERROR_ICONS[kind]
  const isJaVisitat = kind === 'ja_visitat'

  const titleKey = `scanner.error.${kind}.title` as TKey
  const subtitleKey = `scanner.error.${kind}.subtitle` as TKey
  const subtitle = isJaVisitat
    ? format(t(subtitleKey, lang), { nom: comercNom ?? '' })
    : t(subtitleKey, lang)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-40 flex items-end justify-center bg-km0-blue-900/70 backdrop-blur-sm"
    >
      <div className="w-full rounded-t-3xl bg-km0-beige-50 text-km0-blue-900 p-6 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-km0-yellow-100 flex items-center justify-center">
          <Icon size={28} strokeWidth={2.4} className="text-km0-blue-900" />
        </div>
        <h2 className="font-ui font-bold text-lg text-center">
          {t(titleKey, lang)}
        </h2>
        <p className="mt-2 text-sm font-ui text-km0-blue-900/75 text-center">
          {subtitle}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {isJaVisitat && (
            <button
              type="button"
              onClick={onPromos}
              className="w-full rounded-xl bg-km0-blue-900 text-km0-beige-50 font-ui font-bold text-sm py-3 hover:bg-km0-blue-800 transition-colors"
            >
              {t('scanner.error.ja_visitat.cta_promos', lang)}
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'w-full rounded-xl font-ui font-bold text-sm py-3 transition-colors',
              isJaVisitat
                ? 'bg-transparent text-km0-blue-900 border-2 border-km0-blue-900/20 hover:bg-km0-blue-900/5'
                : 'bg-km0-yellow-400 text-km0-blue-900 hover:bg-km0-yellow-300'
            )}
          >
            {isJaVisitat
              ? t('scanner.error.ja_visitat.cta_next', lang)
              : t('scanner.error.retry', lang)}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface SuccessOverlayProps {
  userName: string
  comercNom: string
  puntsGuanyats: number
  totalPunts: number
}

const SuccessOverlay = ({
  userName,
  comercNom,
  puntsGuanyats,
  totalPunts,
}: SuccessOverlayProps) => {
  const { lang } = useLang()
  const displayName = userName || '🎉'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-km0-blue-900/85 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="w-full rounded-3xl bg-card text-km0-blue-900 p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-km0-yellow-400 flex items-center justify-center">
          <Check size={32} strokeWidth={3} className="text-km0-blue-900" />
        </div>
        <p className="font-ui font-bold text-lg">
          {format(t('scanner.success.title', lang), { nom: displayName })}
        </p>
        <p className="mt-1 text-sm font-ui text-km0-blue-900/75">
          {format(t('scanner.success.subtitle', lang), { comerc: comercNom })}
        </p>
        <p className="mt-4 inline-block rounded-full bg-km0-yellow-100 text-km0-blue-900 font-ui font-bold text-base px-4 py-1">
          {format(t('scanner.success.points', lang), { n: puntsGuanyats })}
        </p>
        <p className="mt-3 text-xs font-ui text-km0-blue-900/60">
          {format(t('scanner.success.total', lang), { n: totalPunts })}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Scanner
