import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Copy, Check, Store, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Reward, Redemption } from '@km0lab/app'

import BubbleSheet from '@/components/BubbleSheet'
import RewardArtwork from '@/components/RewardArtwork'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * RedeemBalanceOverlay — flujo de canje de premios de categoría "saldo".
 *
 * Dos pasos:
 *  1) confirm → resumen del premi + cost, saldo abans/després, CTA Bescanviar.
 *  2) code    → codi de 5 dígits que el client ensenya al comerç. El comerç
 *               l'introdueix al back‑office; quan coincideix, el codi es
 *               marca com a consumit i aplica el descompte corresponent.
 */
export interface RedeemBalanceOverlayProps {
  container?: HTMLElement | null
  reward: Reward
  currentPoints: number
  onClose: () => void
  onConfirmed: () => Promise<Redemption>
}

const fmt = (n: number) => n.toLocaleString('es-ES')

const RedeemBalanceOverlay = ({
  reward,
  container,
  currentPoints,
  onClose,
  onConfirmed,
}: RedeemBalanceOverlayProps) => {
  const { lang } = useLang()
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'confirm' | 'code'>('confirm')
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const balanceAfter = useMemo(
    () => Math.max(0, currentPoints - reward.costPoints),
    [currentPoints, reward.costPoints]
  )

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(id)
  }, [copied])

  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const redemption = await onConfirmed()
      setCode(redemption.code)
      setStep('code')
    } catch {
      toast.error(t('account.error', lang))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
      toast.error(t('clipboard.error', lang))
    }
  }

  return (
    <BubbleSheet
      open
      onClose={onClose}
      title={
        step === 'confirm'
          ? t('redeem.title_confirm', lang)
          : t('redeem.title_code', lang)
      }
      lang={lang}
      container={container}
    >
      <p className="mb-3 font-body text-[11px] text-muted-foreground">
        {t('account.demo', lang)}
      </p>
      <AnimatePresence mode="wait">
        {step === 'confirm' ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-5 flex flex-col gap-4"
          >
            {/* Resum del premi */}
            <div className="rounded-2xl border border-km0-blue-100 bg-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300 flex items-center justify-center shrink-0">
                <RewardArtwork
                  kind={reward.kind}
                  imageUrl={reward.imageUrl}
                  className="h-full rounded-xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-brand font-black text-base text-km0-blue-900 leading-tight break-words">
                  {reward.title}
                </p>
                <p className="font-body text-xs text-km0-blue-800/70">
                  {reward.scope}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-km0-yellow-400 px-2.5 py-1 text-[11px] font-ui font-black tabular-nums text-km0-blue-900">
                {t('rewards.cost', lang).replace('{n}', fmt(reward.costPoints))}
              </span>
            </div>

            {/* Saldo */}
            <div className="rounded-2xl border border-km0-blue-100 bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-km0-yellow-500" />
                  <span className="font-ui font-bold text-xs text-km0-blue-800/70">
                    {t('redeem.current_balance', lang)}
                  </span>
                </div>
                <span className="font-ui font-black text-sm text-km0-blue-900 tabular-nums">
                  {fmt(currentPoints)} pts
                </span>
              </div>
              <div className="h-px my-3 bg-km0-blue-100" />
              <div className="flex items-center justify-between">
                <span className="font-ui font-bold text-xs text-km0-blue-800/70">
                  {t('redeem.balance_after', lang)}
                </span>
                <span className="font-ui font-black text-sm text-km0-teal-700 tabular-nums">
                  {fmt(balanceAfter)} pts
                </span>
              </div>
            </div>

            {/* Explicació del procés */}
            <ol className="rounded-2xl border border-km0-blue-100 bg-card p-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-km0-blue-800 text-primary-foreground text-[11px] font-ui font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem.step1', lang)}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-km0-blue-800 text-primary-foreground text-[11px] font-ui font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem.step2', lang)}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-km0-blue-800 text-primary-foreground text-[11px] font-ui font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem.step3', lang)}
                </p>
              </li>
            </ol>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="bubbleSurface"
                type="button"
                disabled={submitting}
                onClick={handleConfirm}
                className="w-full rounded-full bg-km0-yellow-400 hover:bg-km0-yellow-500 text-km0-blue-900 font-ui font-black text-sm py-3.5 active:scale-[0.98] transition-transform"
              >
                {t('redeem.cta_confirm', lang)}
              </Button>
              <Button
                variant="bubbleSurface"
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-transparent text-km0-blue-800/70 font-ui font-bold text-xs py-2"
              >
                {t('common.cancel', lang)}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-5 flex flex-col gap-4"
          >
            {/* Codi */}
            {code && (
              <div className="rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 p-5 text-center">
                <p className="font-ui font-bold text-[11px] uppercase tracking-widest text-primary-foreground/60">
                  {t('redeem.code_label', lang)}
                </p>
                <div
                  aria-label={t('redeem.code_label', lang)}
                  className="mt-2 flex items-center justify-center gap-2"
                >
                  {code?.split('').map((digit, i) => (
                    <span
                      key={i}
                      className={cn(
                        'w-11 h-14 rounded-xl bg-card/10 border border-primary-foreground/25',
                        'flex items-center justify-center',
                        'font-brand font-black text-3xl text-primary-foreground tabular-nums'
                      )}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <p className="mt-3 font-body text-xs text-primary-foreground/80">
                  {t('redeem.code_hint', lang)}
                </p>
                <Button
                  variant="bubbleSurface"
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card/10 border border-primary-foreground/25 px-3 py-1.5 text-xs font-ui font-bold text-primary-foreground active:scale-95 transition-transform"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> {t('redeem.copied', lang)}
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> {t('redeem.copy_code', lang)}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Estat + premi resum */}
            <div className="rounded-2xl border border-km0-blue-100 bg-card p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-km0-yellow-100 flex items-center justify-center shrink-0">
                <RewardArtwork
                  kind={reward.kind}
                  imageUrl={reward.imageUrl}
                  className="h-full rounded-xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-brand font-black text-sm text-km0-blue-900 leading-tight break-words">
                  {reward.title}
                </p>
                <p className="font-body text-[11px] text-km0-blue-800/60">
                  {reward.scope}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-km0-coral-100 px-2.5 py-1 text-[10px] font-ui font-black uppercase tracking-wide text-km0-coral-500">
                {t('redeem.status_pending', lang)}
              </span>
            </div>

            {/* Instruccions comerç */}
            <div className="rounded-2xl border border-km0-blue-100 bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Store
                  size={18}
                  className="text-km0-blue-800 mt-0.5 shrink-0"
                />
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem.instructions_show', lang)}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-km0-teal-700 mt-0.5 shrink-0"
                />
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem.instructions_validate', lang)}
                </p>
              </div>
            </div>

            <Button
              variant="bubbleSurface"
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-km0-blue-800 text-primary-foreground font-ui font-black text-sm py-3.5 active:scale-[0.98] transition-transform"
            >
              {t('redeem.cta_done', lang)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </BubbleSheet>
  )
}

export default RedeemBalanceOverlay
