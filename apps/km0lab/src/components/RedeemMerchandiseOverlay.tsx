import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Gift,
  Coins,
  Store,
  PackageCheck,
  Ticket,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'
import { cn } from '@/lib/utils'
import type { Reward, RewardKind } from '@km0lab/app'

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
  reward: Reward
  currentPoints: number
  onClose: () => void
  onConfirmed?: (payload: { code: string; costPoints: number }) => void
}

const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Gift,
}

const fmt = (n: number) => n.toLocaleString('es-ES')

const generateCode = () => Math.floor(10000 + Math.random() * 90000).toString()

const RedeemMerchandiseOverlay = ({
  reward,
  currentPoints,
  onClose,
  onConfirmed,
}: RedeemMerchandiseOverlayProps) => {
  const { lang } = useLang()
  const [step, setStep] = useState<'confirm' | 'pending'>('confirm')

  const KindIcon = KIND_ICON[reward.kind]

  const balanceAfter = useMemo(
    () => Math.max(0, currentPoints - reward.costPoints),
    [currentPoints, reward.costPoints]
  )

  const handleRequest = () => {
    const newCode = generateCode()
    setStep('pending')
    onConfirmed?.({ code: newCode, costPoints: reward.costPoints })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <motion.button
        type="button"
        aria-label={t('common.close', lang)}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-km0-blue-900/50 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full max-w-[430px] max-h-[92%] overflow-y-auto rounded-t-3xl bg-km0-beige-50 shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-3 pb-2 bg-km0-beige-50">
          <div className="w-10 h-1.5 rounded-full bg-km0-blue-100 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="w-8" aria-hidden />
          <h2 className="font-brand font-black text-sm text-km0-blue-900 pt-2">
            {step === 'confirm'
              ? t('redeem_merch.title_confirm', lang)
              : t('redeem_merch.title_pending', lang)}
          </h2>
          <button
            type="button"
            aria-label={t('common.close', lang)}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-km0-blue-100 active:scale-95 transition-transform"
          >
            <X size={16} className="text-km0-blue-800" />
          </button>
        </div>

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
              <div className="rounded-2xl border border-km0-blue-100 bg-white p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300 flex items-center justify-center shrink-0">
                  <KindIcon
                    size={28}
                    className="text-km0-blue-900"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-brand font-black text-base text-km0-blue-900 leading-tight truncate">
                    {reward.title}
                  </p>
                  <p className="font-body text-xs text-km0-blue-800/70">
                    {reward.scope}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-km0-yellow-400 px-2.5 py-1 text-[11px] font-ui font-black tabular-nums text-km0-blue-900">
                  {t('rewards.cost', lang).replace(
                    '{n}',
                    fmt(reward.costPoints)
                  )}
                </span>
              </div>

              <div className="rounded-2xl border border-km0-blue-100 bg-white p-4">
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

              <ol className="rounded-2xl border border-km0-blue-100 bg-white p-4 space-y-3">
                {[
                  'redeem_merch.step1',
                  'redeem_merch.step2',
                  'redeem_merch.step3',
                ].map((key, idx) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-km0-blue-800 text-white text-[11px] font-ui font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="font-body text-xs text-km0-blue-900">
                      {t(key as Parameters<typeof t>[0], lang)}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRequest}
                  className="w-full rounded-full bg-km0-yellow-400 hover:bg-km0-yellow-500 text-km0-blue-900 font-ui font-black text-sm py-3.5 active:scale-[0.98] transition-transform"
                >
                  {t('redeem_merch.cta_request', lang)}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full bg-transparent text-km0-blue-800/70 font-ui font-bold text-xs py-2"
                >
                  {t('common.cancel', lang)}
                </button>
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
                <p className="font-ui font-bold text-[11px] uppercase tracking-widest text-white/60">
                  {t('redeem_merch.status_pending', lang)}
                </p>
                <p className="mt-2 font-body text-sm text-white">
                  {t('redeem_merch.pending_hint', lang)}
                </p>
              </div>

              <div className="rounded-2xl border border-km0-blue-100 bg-white p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-km0-yellow-100 flex items-center justify-center shrink-0">
                  <KindIcon
                    size={22}
                    className="text-km0-blue-900"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-brand font-black text-sm text-km0-blue-900 leading-tight truncate">
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

              <div className="rounded-2xl border border-km0-blue-100 bg-white p-4 space-y-3">
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

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-km0-blue-800 text-white font-ui font-black text-sm py-3.5 active:scale-[0.98] transition-transform"
              >
                {t('redeem.cta_done', lang)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default RedeemMerchandiseOverlay
