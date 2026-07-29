import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Gift,
  Ticket,
  Percent,
  ShoppingBag,
  Package,
  Coins,
  Tag,
  type LucideIcon,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import RedeemBalanceOverlay from '@/components/RedeemBalanceOverlay'
import RedeemMerchandiseOverlay from '@/components/RedeemMerchandiseOverlay'
import { useLang } from '@/contexts/LangContext'
import { t, type TKey } from '@km0lab/app'
import { cn } from '@/lib/utils'
import { REWARDS } from '@/data/rewards'
import { COMERCIOS_DETALL } from '@/data/comerciosAdheridos'
import type { PromocioInfo } from '@km0lab/app'
import type { Reward, RewardCategory, RewardKind } from '@km0lab/app'

type TopTab = 'rewards' | 'promos'
type Filter = 'all' | RewardCategory

interface PromoRow {
  promo: PromocioInfo
  shopId: string
  shopName: string
  shopEmoji?: string
  shopImage?: string
  shopBg?: string
}

const CATEGORY_KEY: Record<RewardCategory, TKey> = {
  balance: 'rewards.category.balance',
  experience: 'rewards.category.experience',
  merchandising: 'rewards.category.merchandising',
  discount: 'rewards.category.discount',
}

const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
}

const fmt = (n: number) => n.toLocaleString('es-ES')

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

/* ─── Tarjeta de premio ──────────────────────────────────── */
interface RewardCardProps {
  reward: Reward
  points: number
  index: number
  onRedeem?: (reward: Reward) => void
}

const RewardCard = ({ reward, points, index, onRedeem }: RewardCardProps) => {
  const { lang } = useLang()
  const KindIcon = KIND_ICON[reward.kind]

  const isSoldOut = reward.status === 'sold_out'
  const isInactive = reward.status === 'inactive'
  const missingPoints = Math.max(0, reward.costPoints - points)
  const canAfford = missingPoints === 0

  // Esgotat / inactiu conserven el seu propi estat visual; la resta mostra
  // clarament si l'usuari pot bescanviar el premi o li falten punts.
  const dimmed = isSoldOut || isInactive

  const statusChip = isSoldOut
    ? {
        key: 'rewards.status.sold_out' as TKey,
        cls: 'bg-km0-coral-100 text-km0-coral-500',
      }
    : isInactive
      ? {
          key: 'rewards.status.inactive' as TKey,
          cls: 'bg-km0-blue-100 text-km0-blue-800/70',
        }
      : {
          key: 'rewards.status.active' as TKey,
          cls: 'bg-km0-teal-100 text-km0-teal-700',
        }

  const stockLabel =
    reward.stock === null
      ? t('rewards.stock_unlimited', lang)
      : t('rewards.stock_units', lang).replace('{n}', String(reward.stock))

  const costActive = canAfford && !isSoldOut && !isInactive

  const redeemStatus = isSoldOut
    ? {
        key: 'rewards.status.sold_out' as TKey,
        cls: 'bg-km0-coral-100 text-km0-coral-500',
      }
    : isInactive
      ? {
          key: 'rewards.status.inactive' as TKey,
          cls: 'bg-km0-blue-100 text-km0-blue-800/70',
        }
      : canAfford
        ? {
            key: 'rewards.status.can_redeem' as TKey,
            cls: 'bg-km0-teal-100 text-km0-teal-700',
          }
        : {
            key: 'rewards.status.missing_points' as TKey,
            cls: 'bg-km0-coral-100 text-km0-coral-500',
          }

  const statusLabel = t(redeemStatus.key, lang).replace(
    '{n}',
    fmt(missingPoints)
  )

  const isRedeemable = canAfford && !isSoldOut && !isInactive

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.28) }}
      onClick={isRedeemable ? () => onRedeem?.(reward) : undefined}
      role={isRedeemable ? 'button' : undefined}
      tabIndex={isRedeemable ? 0 : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-km0-blue-100',
        'shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)]',
        'flex flex-col',
        isRedeemable &&
          'cursor-pointer active:scale-[0.98] transition-transform'
      )}
    >
      {/* Cabecera: banda con icono grande + chip estado */}
      <div
        className={cn(
          'relative h-32 flex items-center justify-center',
          'bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300',
          dimmed && 'opacity-60'
        )}
      >
        {/* Chip categoría (top-left) */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/85 text-[10px] font-ui font-bold text-km0-blue-800 uppercase tracking-wide">
          {t(CATEGORY_KEY[reward.category], lang)}
        </span>
        {/* Chip estado (top-right) */}
        <span
          className={cn(
            'absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide',
            statusChip.cls
          )}
        >
          {t(statusChip.key, lang)}
        </span>

        <KindIcon
          size={56}
          strokeWidth={1.8}
          className={cn('text-km0-blue-900', dimmed && 'grayscale-[0.3]')}
        />
      </div>

      {/* Cuerpo */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-brand font-black text-sm text-km0-blue-900 leading-tight">
            {reward.title}
          </h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-1 text-[11px] font-ui font-black tabular-nums',
              costActive
                ? 'bg-km0-yellow-400 text-km0-blue-900'
                : 'bg-km0-beige-100 text-km0-blue-800/70'
            )}
          >
            {t('rewards.cost', lang).replace('{n}', fmt(reward.costPoints))}
          </span>
        </div>

        <p className="font-body text-xs text-km0-blue-800/70 leading-snug">
          {reward.description}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
              {t('rewards.value', lang)}
            </p>
            <p className="font-ui font-bold text-xs text-km0-blue-900">
              {reward.valueLabel}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
              {t('rewards.stock', lang)}
            </p>
            <p className="font-ui font-bold text-xs text-km0-blue-900 flex items-center gap-1">
              <Package size={12} className="text-km0-blue-800/60" />
              {stockLabel}
            </p>
          </div>
        </div>

        <p className="font-body text-[11px] text-km0-blue-800/60 pt-0.5 truncate">
          {reward.scope}
        </p>

        <div
          className={cn(
            'mt-auto w-full rounded-full px-3 py-1.5 text-center text-xs font-ui font-bold',
            redeemStatus.cls
          )}
        >
          {statusLabel}
        </div>
      </div>
    </motion.article>
  )
}

/* ─── Tarjeta de promoción de comercio ───────────────────── */
interface PromoCardProps {
  row: PromoRow
  index: number
}

const PromoCard = ({ row, index }: PromoCardProps) => {
  const { lang } = useLang()
  const l = lang === 'en' ? 'es' : lang
  const { promo, shopName, shopEmoji, shopImage, shopBg } = row

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.28) }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-km0-blue-100',
        'shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)]',
        'flex flex-col p-3 gap-2'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-km0-blue-100',
            shopBg ?? 'bg-km0-beige-100'
          )}
        >
          {shopImage ? (
            <img
              src={shopImage}
              alt=""
              aria-hidden
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <span className="text-lg" aria-hidden>
              {shopEmoji ?? '🛍️'}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/60 truncate">
            {t('rewards.promos.at', lang).replace('{shop}', shopName)}
          </p>
          <h3 className="font-brand font-black text-sm text-km0-blue-900 leading-tight truncate">
            {promo.titol[l]}
          </h3>
        </div>
        <span className="shrink-0 rounded-full px-2 py-1 text-[11px] font-ui font-black bg-km0-coral-400 text-white">
          {promo.etiqueta}
        </span>
      </div>

      <p className="font-body text-xs text-km0-blue-800/80 leading-snug">
        {promo.detall[l]}
      </p>

      {promo.condicio && (
        <p className="font-body text-[11px] text-km0-blue-800/60 leading-snug flex items-start gap-1">
          <Tag size={11} className="mt-0.5 shrink-0 text-km0-blue-800/50" />
          <span>{promo.condicio[l]}</span>
        </p>
      )}
    </motion.article>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const Premis = () => {
  const navigate = useNavigate()
  const { lang } = useLang()

  // Demo: saldo de ejemplo alto para visualizar el estado "Pots bescanviar".
  const [points, setPoints] = useState(2500)
  const [redeeming, setRedeeming] = useState<Reward | null>(null)

  const [searchParams] = useSearchParams()
  const initialTab: TopTab =
    searchParams.get('tab') === 'promos' ? 'promos' : 'rewards'
  const [topTab, setTopTab] = useState<TopTab>(initialTab)
  const [filter, setFilter] = useState<Filter>('balance')

  const categories = useMemo<RewardCategory[]>(() => {
    const set = new Set<RewardCategory>()
    for (const r of REWARDS) set.add(r.category)
    return Array.from(set)
  }, [])

  const filtered = useMemo(
    () => REWARDS.filter((r) => r.category === filter),
    [filter]
  )

  const promoRows = useMemo<PromoRow[]>(() => {
    const rows: PromoRow[] = []
    for (const shop of Object.values(COMERCIOS_DETALL)) {
      for (const promo of shop.promocions) {
        rows.push({
          promo,
          shopId: shop.id,
          shopName: shop.nom,
          shopEmoji: shop.emoji,
          shopImage: shop.imatge,
          shopBg: shop.bg,
        })
      }
    }
    return rows
  }, [])

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
          <header className="shrink-0 flex items-center gap-2 px-3 pt-4 pb-3 bg-km0-beige-50">
            <button
              type="button"
              onClick={() => navigate('/home')}
              aria-label={t('common.back', lang)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-km0-blue-100 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-km0-blue-800" />
            </button>
            <h1 className="flex-1 text-center font-brand font-black text-base text-km0-blue-900 pr-10">
              {t('rewards.title', lang)}
            </h1>
          </header>

          {/* Saldo */}
          <section className="shrink-0 px-4 pb-2">
            <div className="flex items-center gap-2 rounded-full bg-white border border-km0-blue-100 px-3 py-1.5 w-fit">
              <Coins size={14} className="text-km0-yellow-500" />
              <span className="font-ui font-bold text-xs text-km0-blue-900">
                {t('rewards.balance_label', lang).replace('{n}', fmt(points))}
              </span>
            </div>
          </section>

          {/* Top tabs: Premis / Promocions */}
          <div className="shrink-0 px-4 pb-2 flex items-center gap-1 bg-km0-beige-50">
            <div className="flex items-center gap-1 rounded-full bg-white border border-km0-blue-100 p-1 w-full">
              {(['rewards', 'promos'] as TopTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTopTab(tab)}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-colors',
                    topTab === tab
                      ? 'bg-km0-blue-800 text-white'
                      : 'bg-transparent text-km0-blue-800'
                  )}
                >
                  {t(
                    tab === 'rewards'
                      ? 'rewards.tab.rewards'
                      : 'rewards.tab.promos',
                    lang
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros (solo en Premis) */}
          {topTab === 'rewards' && (
            <div className="shrink-0 px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => (
                <FilterChip
                  key={c}
                  active={filter === c}
                  onClick={() => setFilter(c)}
                  label={t(CATEGORY_KEY[c], lang)}
                />
              ))}
            </div>
          )}

          {topTab === 'promos' && (
            <p className="shrink-0 px-4 pb-2 font-body text-[11px] text-km0-blue-800/60 leading-snug">
              {t('rewards.promos.info', lang)}
            </p>
          )}

          {/* Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-1 pb-6">
            {topTab === 'rewards' ? (
              filtered.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center px-6">
                  <p className="font-body text-sm text-km0-blue-800/60">
                    {t('rewards.empty', lang)}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((r, i) => (
                    <RewardCard
                      key={r.id}
                      reward={r}
                      points={points}
                      index={i}
                      onRedeem={setRedeeming}
                    />
                  ))}
                </div>
              )
            ) : promoRows.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('rewards.promos.empty', lang)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {promoRows.map((row, i) => (
                  <PromoCard
                    key={`${row.shopId}-${row.promo.id}`}
                    row={row}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>

          {redeeming && redeeming.category === 'balance' && (
            <RedeemBalanceOverlay
              reward={redeeming}
              currentPoints={points}
              onClose={() => setRedeeming(null)}
              onConfirmed={({ costPoints }) =>
                setPoints((p) => Math.max(0, p - costPoints))
              }
            />
          )}
          {redeeming && redeeming.category !== 'balance' && (
            <RedeemMerchandiseOverlay
              reward={redeeming}
              currentPoints={points}
              onClose={() => setRedeeming(null)}
              onConfirmed={({ costPoints }) =>
                setPoints((p) => Math.max(0, p - costPoints))
              }
            />
          )}
        </div>
      </div>
    </DeviceShell>
  )
}

export default Premis
