import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Store, PackageCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Reward, Redemption } from '@km0lab/app'

import BubbleSheet from '@/components/BubbleSheet'
import RewardArtwork from '@/components/RewardArtwork'
import { useLang } from '@/contexts/LangContext'

/**
 * RedeemMerchandiseOverlay — flujo de canje de premios físicos / experiencia.
 *
 * A diferencia del saldo, el premio requiere recogida presencial:
 *  1) confirm → resumen + saldo abans/després, CTA "Sol·licitar bescanvi".
 *  2) pending → estat "Pendent de lliurament". El comerç valida el canje
 *               manualment al back‑office; el client només ha de presentar-se
 *               al punt de recollida. No es mostra codi de 5 dígits en pantalla.
 */
export interface RedeemMerchandiseOverlayProps {
  container?: HTMLElement | null
  reward: Reward
  currentPoints: number
  onClose: () => void
  onConfirmed: () => Promise<Redemption>
}

const fmt = (n: number) => n.toLocaleString('es-ES')

const RedeemMerchandiseOverlay = ({
  reward,
  container,
  currentPoints,
  onClose,
  onConfirmed,
}: RedeemMerchandiseOverlayProps) => {
  const { lang } = useLang()
  const [code, setCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'confirm' | 'pending'>('confirm')

  const balanceAfter = useMemo(
    () => Math.max(0, currentPoints - reward.costPoints),
    [currentPoints, reward.costPoints]
  )

  const handleRequest = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const redemption = await onConfirmed()
      setCode(redemption.code)
      setStep('pending')
    } catch {
      toast.error(t('account.error', lang))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BubbleSheet
      open
      onClose={onClose}
      title={
        step === 'confirm'
          ? t('redeem_merch.title_confirm', lang)
          : t('redeem_merch.title_pending', lang)
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

            <ol className="rounded-2xl border border-km0-blue-100 bg-card p-4 space-y-3">
              {[
                'redeem_merch.step1',
                'redeem_merch.step2',
                'redeem_merch.step3',
              ].map((key, idx) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-km0-blue-800 text-primary-foreground text-[11px] font-ui font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="font-body text-xs text-km0-blue-900">
                    {t(key as Parameters<typeof t>[0], lang)}
                  </p>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="bubbleSurface"
                type="button"
                disabled={submitting}
                onClick={handleRequest}
                className="w-full rounded-full bg-km0-yellow-400 hover:bg-km0-yellow-500 text-km0-blue-900 font-ui font-black text-sm py-3.5 active:scale-[0.98] transition-transform"
              >
                {t('redeem_merch.cta_request', lang)}
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
            key="pending"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-5 flex flex-col gap-4"
          >
            <div className="rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 p-5 text-center">
              {code && (
                <>
                  <p className="font-ui text-xs text-primary-foreground">
                    {t('redemptions.code', lang)}
                  </p>
                  <p className="mt-2 font-brand text-3xl font-black text-primary-foreground">
                    {code}
                  </p>
                </>
              )}
              <p className="font-ui font-bold text-[11px] uppercase tracking-widest text-primary-foreground/60">
                {t('redeem_merch.status_pending', lang)}
              </p>
              <p className="mt-2 font-body text-sm text-primary-foreground">
                {t('redeem_merch.pending_hint', lang)}
              </p>
            </div>

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
                {t('redeem_merch.status_pending', lang)}
              </span>
            </div>

            <div className="rounded-2xl border border-km0-blue-100 bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Store
                  size={18}
                  className="text-km0-blue-800 mt-0.5 shrink-0"
                />
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem_merch.instructions_pickup', lang)}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <PackageCheck
                  size={18}
                  className="text-km0-teal-700 mt-0.5 shrink-0"
                />
                <p className="font-body text-xs text-km0-blue-900">
                  {t('redeem_merch.instructions_confirm', lang)}
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

export default RedeemMerchandiseOverlay
