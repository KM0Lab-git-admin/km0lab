import {
  isPendingRedemption,
  useAccount,
  usePreviewState,
  useDragScroll,
  useAuth,
  t,
  type Lang,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import {
  Gift,
  PackageCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Redemption, RedemptionStatus } from '@km0lab/app'

import BottomTabs from '@/components/AccountBottomTabs'
import FilterChip from '@/components/FilterChip'
import RewardCardFrame from '@/components/RewardCardFrame'
import ScreenHeader from '@/components/ScreenHeader'
import ScreenStatus from '@/components/ScreenStatus'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─── Filtros ────────────────────────────────────────────── */
type Filter = 'all' | RedemptionStatus

const STATUS_META: Record<
  RedemptionStatus,
  { labelKey: Parameters<typeof t>[0]; cls: string; Icon: LucideIcon }
> = {
  pending: {
    labelKey: 'redemptions.status.pending',
    cls: 'bg-km0-yellow-100 text-km0-blue-800',
    Icon: Clock,
  },
  ready: {
    labelKey: 'redemptions.status.ready',
    cls: 'bg-km0-teal-100 text-km0-teal-700',
    Icon: PackageCheck,
  },
  redeemed: {
    labelKey: 'redemptions.status.redeemed',
    cls: 'bg-km0-blue-100 text-km0-blue-800',
    Icon: CheckCircle2,
  },
  expired: {
    labelKey: 'redemptions.status.expired',
    cls: 'bg-km0-coral-100 text-km0-coral-500',
    Icon: AlertCircle,
  },
}

/* ─── Helpers de formato ─────────────────────────────────── */
const fmtInt = (n: number) => n.toLocaleString('es-ES')

const formatDate = (iso: string, lang: Lang): string => {
  const d = new Date(iso)
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return d
    .toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(/\.$/, '')
}

const isFutureOrToday = (iso: string) => {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d.getTime() >= today.getTime()
}

/* ─── Tarjeta de bescanvi ────────────────────────────────── */
const RedemptionCard = ({
  redemption,
  index,
}: {
  redemption: Redemption
  index: number
}) => {
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)

  const status = STATUS_META[redemption.status]
  const StatusIcon = status.Icon

  const showCode = !!redemption.code && isPendingRedemption(redemption)

  const handleCopy = async () => {
    if (!redemption.code) return
    try {
      await navigator.clipboard.writeText(redemption.code)
      setCopied(true)
    } catch {
      setCopied(false)
      toast.error(t('clipboard.error', lang))
    }
  }
  return (
    <RewardCardFrame
      title={redemption.rewardTitle}
      description={redemption.rewardDescription}
      kind={redemption.rewardKind}
      imageUrl={redemption.imageUrl}
      points={redemption.costPoints}
      badge={
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 font-ui text-[10px] font-bold',
            status.cls
          )}
        >
          <StatusIcon size={12} />
          {t(status.labelKey, lang)}
        </span>
      }
    >
      {/* Cuerpo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
            {t('redemptions.date', lang)}
          </p>
          <p className="font-ui font-bold text-xs text-km0-blue-900">
            {formatDate(redemption.redeemedAt, lang)}
          </p>
        </div>
        <div>
          <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
            {t('redemptions.value', lang)}
          </p>
          <p className="font-ui font-bold text-xs text-km0-blue-900">
            {redemption.valueLabel}
          </p>
        </div>
      </div>

      {redemption.shopName && (
        <div>
          <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
            {t('redemptions.shop', lang)}
          </p>
          <p className="font-ui font-bold text-xs text-km0-blue-900">
            {redemption.shopName}
          </p>
        </div>
      )}

      {showCode && (
        <div className="rounded-xl bg-km0-beige-100 border border-km0-blue-100 p-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
              {t('redemptions.code', lang)}
            </p>
            <p className="font-brand font-black text-lg text-km0-blue-900 tracking-widest">
              {redemption.code}
            </p>
          </div>
          <Button
            variant="bubbleSurface"
            type="button"
            onClick={handleCopy}
            className="shrink-0 w-9 h-9 rounded-full bg-card border border-km0-blue-100 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t('redeem.copy_code', lang)}
          >
            {copied ? (
              <Check size={16} className="text-km0-teal-700" />
            ) : (
              <Copy size={16} className="text-km0-blue-800" />
            )}
          </Button>
        </div>
      )}

      {redemption.expiresAt && redemption.status !== 'expired' && (
        <p
          className={cn(
            'font-body text-[11px]',
            isFutureOrToday(redemption.expiresAt)
              ? 'text-km0-blue-800/60'
              : 'text-km0-coral-500'
          )}
        >
          {t('redemptions.expires', lang).replace(
            '{date}',
            formatDate(redemption.expiresAt, lang)
          )}
        </p>
      )}

      {redemption.status === 'expired' && redemption.expiresAt && (
        <p className="font-body text-[11px] text-km0-coral-500">
          {t('redemptions.expired_on', lang).replace(
            '{date}',
            formatDate(redemption.expiresAt, lang)
          )}
        </p>
      )}

      {redemption.completedAt && redemption.status === 'redeemed' && (
        <p className="font-body text-[11px] text-km0-blue-800/60">
          {t('redemptions.completed', lang).replace(
            '{date}',
            formatDate(redemption.completedAt, lang)
          )}
        </p>
      )}
    </RewardCardFrame>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const PremisCanjats = () => {
  const navigate = useNavigate()
  const account = useAccount()
  const { lang } = useLang()
  const { user } = useAuth()
  const isAuthed = !!user
  const scrollRef = useDragScroll('vertical')
  const [filter, setFilter] = useState<Filter>('all')

  const goToHome = () => navigate('/home')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToProfile = () => navigate('/profile')
  const goToRewards = () => {}
  const goToActions = () => navigate('/points-actions')

  const sorted = useMemo(
    () =>
      [...account.redemptions].sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      ),
    [account.redemptions]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted
    return sorted.filter((r) =>
      filter === 'pending' ? isPendingRedemption(r) : r.status === filter
    )
  }, [sorted, filter])

  const counts = useMemo(() => {
    const total = sorted.length
    const active = sorted.filter((r) => isPendingRedemption(r)).length
    return { total, active }
  }, [sorted])

  const filters: { key: Filter; labelKey: Parameters<typeof t>[0] }[] = [
    { key: 'all', labelKey: 'redemptions.filter.all' },
    { key: 'pending', labelKey: 'redemptions.filter.pending' },
    { key: 'redeemed', labelKey: 'redemptions.filter.redeemed' },
    { key: 'expired', labelKey: 'redemptions.filter.expired' },
  ]

  const preview = usePreviewState(
    account.loading,
    !!account.error,
    filtered.length === 0
  )

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
          <ScreenHeader title={t('redemptions.title', lang)} />

          {/* Lista */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6"
          >
            {/* Resumen */}
            <section className="shrink-0 px-4 pb-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[var(--shadow-bubble)]"
              >
                <Gift
                  className="absolute -bottom-3 -right-3 w-24 h-24 text-primary-foreground/5 rotate-12 pointer-events-none"
                  strokeWidth={1}
                />
                <p className="relative z-10 font-body text-xs text-primary-foreground/70 uppercase tracking-wide">
                  {t('redemptions.summary', lang)}
                </p>
                <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-brand font-black text-primary-foreground text-3xl tabular-nums">
                    {counts.total}
                  </span>
                  <span className="font-body text-primary-foreground/70 text-sm">
                    {counts.total === 1
                      ? t('redemptions.reward_one', lang)
                      : t('redemptions.reward_many', lang)}
                  </span>
                </div>
                {counts.active > 0 && (
                  <p className="relative z-10 mt-2 font-body text-xs text-km0-yellow-100">
                    {counts.active === 1
                      ? t('redemptions.active_one', lang)
                      : t('redemptions.active_many', lang).replace(
                          '{n}',
                          String(counts.active)
                        )}
                  </p>
                )}
              </motion.div>
            </section>

            {/* Filtros */}
            <div className="shrink-0 px-4 pb-2 flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <FilterChip
                  key={f.key}
                  active={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  label={t(f.labelKey, lang)}
                />
              ))}
            </div>

            <p className="mb-3 font-body text-[11px] text-muted-foreground">
              {t('account.demo', lang)}
            </p>
            {preview.state !== 'ready' ? (
              <ScreenStatus
                state={preview.state}
                emptyKey="redemptions.empty"
                onRetry={() => preview.retry(account.reload)}
              />
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                {filtered.map((r, i) => (
                  <RedemptionCard key={r.id} redemption={r} index={i} />
                ))}
              </div>
            )}
          </div>

          <BottomTabs
            activeTab="rewards"
            isAuthed={isAuthed}
            onLogin={goToLogin}
            onHome={goToHome}
            onProfile={goToProfile}
            onPoints={goToPoints}
            onRewards={goToRewards}
            onActions={goToActions}
          />
        </div>
      </div>
    </>
  )
}

export default PremisCanjats
