import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Gift,
  Ticket,
  ShoppingBag,
  Percent,
  PackageCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  type LucideIcon,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import BottomTabs from '@/components/BottomTabs'
import { useAuth, useMyRedemptions } from '@km0lab/app'
import { useLang } from '@/contexts/LangContext'
import { t, type Lang } from '@km0lab/app'
import { cn } from '@/lib/utils'
import type { Redemption, RedemptionStatus, RewardKind } from '@km0lab/app'

/* ─── Filtros ────────────────────────────────────────────── */
type Filter = 'all' | RedemptionStatus

/* ─── Mapa tipo → icono ──────────────────────────────────── */
const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
}

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

/* ─── Chip filtro ────────────────────────────────────────── */
const FilterChip = ({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'shrink-0 px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-colors',
      active
        ? 'bg-km0-blue-800 text-white'
        : 'bg-white text-km0-blue-800 border border-km0-blue-100'
    )}
  >
    {label}
  </button>
)

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
  const [imgFailed, setImgFailed] = useState(false)

  const KindIcon = KIND_ICON[redemption.rewardKind]
  const status = STATUS_META[redemption.status]
  const StatusIcon = status.Icon

  const showCode =
    !!redemption.code &&
    (redemption.status === 'pending' || redemption.status === 'ready')
  const showImage = Boolean(
    redemption.hasImage && redemption.imageUrl && !imgFailed
  )

  const handleCopy = () => {
    if (!redemption.code) return
    void navigator.clipboard.writeText(redemption.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="rounded-2xl bg-white border border-km0-blue-100 overflow-hidden shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)]"
    >
      {/* Cabecera: imagen del premio o icono por tipo */}
      <div
        className={cn(
          'relative aspect-[16/10] flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300',
          redemption.status === 'expired' && 'opacity-60'
        )}
      >
        <span
          className={cn(
            'absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide flex items-center gap-1',
            status.cls
          )}
        >
          <StatusIcon size={12} />
          {t(status.labelKey, lang)}
        </span>
        {showImage ? (
          <img
            src={redemption.imageUrl!}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <KindIcon
            size={48}
            strokeWidth={1.8}
            className={cn(
              'text-km0-blue-900',
              redemption.status === 'expired' && 'grayscale-[0.4]'
            )}
          />
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-brand font-black text-sm text-km0-blue-900 leading-tight">
            {redemption.rewardTitle}
          </h3>
          <span className="shrink-0 rounded-full bg-km0-yellow-400 px-2.5 py-1 text-[11px] font-ui font-black tabular-nums text-km0-blue-900">
            {t('rewards.cost', lang).replace(
              '{n}',
              fmtInt(redemption.costPoints)
            )}
          </span>
        </div>

        <p className="font-body text-xs text-km0-blue-800/70 leading-snug">
          {redemption.rewardDescription}
        </p>

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
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 w-9 h-9 rounded-full bg-white border border-km0-blue-100 flex items-center justify-center active:scale-95 transition-transform"
              aria-label={t('redeem.copy_code', lang)}
            >
              {copied ? (
                <Check size={16} className="text-km0-teal-700" />
              ) : (
                <Copy size={16} className="text-km0-blue-800" />
              )}
            </button>
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
      </div>
    </motion.article>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const PremisCanjats = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const isAuthed = !!user
  const [filter, setFilter] = useState<Filter>('all')
  const { redemptions, loading, error } = useMyRedemptions()

  const goToHome = () => navigate('/home')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToProfile = () => navigate('/profile')
  const goToRewards = () => {}
  const goToActions = () => navigate('/points-actions')

  const sorted = useMemo(
    () =>
      [...redemptions].sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      ),
    [redemptions]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted
    return sorted.filter((r) => r.status === filter)
  }, [sorted, filter])

  const counts = useMemo(() => {
    const total = sorted.length
    const active = sorted.filter(
      (r) => r.status === 'pending' || r.status === 'ready'
    ).length
    return { total, active }
  }, [sorted])

  const filters: { key: Filter; labelKey: Parameters<typeof t>[0] }[] = [
    { key: 'all', labelKey: 'redemptions.filter.all' },
    { key: 'pending', labelKey: 'redemptions.filter.pending' },
    { key: 'redeemed', labelKey: 'redemptions.filter.redeemed' },
  ]

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
          <header className="shrink-0 flex items-center gap-2 px-3 pt-4 pb-3 bg-km0-beige-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={t('common.back', lang)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-km0-blue-100 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-km0-blue-800" />
            </button>
            <h1 className="flex-1 text-center font-brand font-black text-base text-km0-blue-900 pr-10">
              {t('redemptions.title', lang)}
            </h1>
          </header>

          {/* Resumen */}
          <section className="shrink-0 px-4 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[0_12px_28px_-12px_hsl(var(--km0-blue-900)/0.45)]"
            >
              <Gift
                className="absolute -bottom-3 -right-3 w-24 h-24 text-white/5 rotate-12 pointer-events-none"
                strokeWidth={1}
              />
              <p className="relative z-10 font-body text-xs text-white/70 uppercase tracking-wide">
                {t('redemptions.summary', lang)}
              </p>
              <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
                <span className="font-brand font-black text-white text-3xl tabular-nums">
                  {counts.total}
                </span>
                <span className="font-body text-white/70 text-sm">
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
          <div className="shrink-0 px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <FilterChip
                key={f.key}
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
                label={t(f.labelKey, lang)}
              />
            ))}
          </div>

          {/* Lista */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6">
            {loading ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('common.loading', lang)}
                </p>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-coral-500">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('redemptions.empty', lang)}
                </p>
              </div>
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
    </DeviceShell>
  )
}

export default PremisCanjats
