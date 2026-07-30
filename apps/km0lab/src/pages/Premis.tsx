import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  Gift,
  Ticket,
  Percent,
  ShoppingBag,
  Package,
  Coins,
  Tag,
  Store,
  type LucideIcon,
} from 'lucide-react'

import CategoryFilterSheet from '@/components/CategoryFilterSheet'
import DeviceShell from '@/components/DeviceShell'
import RedeemBalanceOverlay from '@/components/RedeemBalanceOverlay'
import RedeemMerchandiseOverlay from '@/components/RedeemMerchandiseOverlay'
import { useLang } from '@/contexts/LangContext'
import {
  t,
  useAuth,
  useHomeRewards,
  useShopCategories,
  useShopPromotions,
  useUserPoints,
  type TKey,
} from '@km0lab/app'
import { cn } from '@/lib/utils'
import type {
  CategoriaAdherit,
  Reward,
  RewardCategory,
  RewardKind,
  ShopPromotion,
} from '@km0lab/app'

type TopTab = 'rewards' | 'promos'

const CATEGORY_ORDER: RewardCategory[] = [
  'balance',
  'experience',
  'merchandising',
  'discount',
]

/** Orden fijo de slugs API con i18n `shopCategories.*`. */
const SHOP_CATEGORY_ORDER = [
  'bakery',
  'food',
  'cafe',
  'restaurant',
  'bar',
  'butcher',
  'greengrocer',
  'fishmonger',
  'pharmacy',
  'bookstore',
  'clothing',
  'hairdresser',
  'services',
  'other',
] as const

const SHOP_CATEGORY_KEY: Record<string, TKey> = {
  bakery: 'shopCategories.bakery',
  food: 'shopCategories.food',
  cafe: 'shopCategories.cafe',
  restaurant: 'shopCategories.restaurant',
  bar: 'shopCategories.bar',
  butcher: 'shopCategories.butcher',
  greengrocer: 'shopCategories.greengrocer',
  fishmonger: 'shopCategories.fishmonger',
  pharmacy: 'shopCategories.pharmacy',
  bookstore: 'shopCategories.bookstore',
  clothing: 'shopCategories.clothing',
  hairdresser: 'shopCategories.hairdresser',
  services: 'shopCategories.services',
  other: 'shopCategories.other',
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

const KIND_GRADIENT: Record<RewardKind, string> = {
  voucher: 'from-km0-yellow-100 to-km0-yellow-300',
  ticket: 'from-km0-teal-100 to-km0-teal-300',
  product: 'from-km0-coral-100 to-km0-coral-300',
  discount: 'from-km0-blue-100 to-km0-blue-300',
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
  isAuthed: boolean
  onRedeem?: (reward: Reward) => void
  onNeedLogin?: () => void
}

const RewardCard = ({
  reward,
  points,
  index,
  isAuthed,
  onRedeem,
  onNeedLogin,
}: RewardCardProps) => {
  const { lang } = useLang()
  const KindIcon = KIND_ICON[reward.kind]
  const [imgFailed, setImgFailed] = useState(false)

  const isSoldOut = reward.status === 'sold_out'
  const isInactive = reward.status === 'inactive'
  const missingPoints = Math.max(0, reward.costPoints - points)
  const canAfford = missingPoints === 0

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

  const costActive = isAuthed && canAfford && !isSoldOut && !isInactive

  const redeemStatus = !isAuthed
    ? {
        key: 'rewards.status.need_register' as TKey,
        cls: 'bg-km0-coral-100 text-km0-coral-500',
      }
    : isSoldOut
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

  const isRedeemable = isAuthed && canAfford && !isSoldOut && !isInactive
  const isGuestAction = !isAuthed && !isSoldOut && !isInactive
  const isClickable = isRedeemable || isGuestAction
  const showImage = Boolean(reward.hasImage && reward.imageUrl && !imgFailed)

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.28) }}
      onClick={
        isRedeemable
          ? () => onRedeem?.(reward)
          : isGuestAction
            ? () => onNeedLogin?.()
            : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-km0-blue-100',
        'shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)]',
        'flex flex-col',
        isClickable && 'cursor-pointer active:scale-[0.98] transition-transform'
      )}
    >
      <div
        className={cn(
          'relative h-32 flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br',
          KIND_GRADIENT[reward.kind],
          dimmed && 'opacity-60'
        )}
      >
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-white/85 text-[10px] font-ui font-bold text-km0-blue-800 uppercase tracking-wide">
          {t(CATEGORY_KEY[reward.category], lang)}
        </span>
        <span
          className={cn(
            'absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide',
            statusChip.cls
          )}
        >
          {t(statusChip.key, lang)}
        </span>

        {showImage ? (
          <img
            src={reward.imageUrl!}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <KindIcon
            size={56}
            strokeWidth={1.8}
            className={cn('text-km0-blue-900', dimmed && 'grayscale-[0.3]')}
          />
        )}
      </div>

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
              {reward.valueLabel || '—'}
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
  promo: ShopPromotion
  index: number
}

const PromoCard = ({ promo, index }: PromoCardProps) => {
  const { lang } = useLang()

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
        <span className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-km0-blue-100 bg-km0-beige-100">
          {promo.shopImageUrl ? (
            <img
              src={promo.shopImageUrl}
              alt=""
              aria-hidden
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <span className="text-lg" aria-hidden>
              {promo.shopEmoji ?? '🛍️'}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          {promo.shopName ? (
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/60 truncate">
              {t('rewards.promos.at', lang).replace('{shop}', promo.shopName)}
            </p>
          ) : null}
          <h3 className="font-brand font-black text-sm text-km0-blue-900 leading-tight truncate">
            {promo.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full px-2 py-1 text-[11px] font-ui font-black bg-km0-coral-400 text-white">
          {promo.label}
        </span>
      </div>

      <p className="font-body text-xs text-km0-blue-800/80 leading-snug">
        {promo.detail}
      </p>

      {promo.conditions ? (
        <p className="font-body text-[11px] text-km0-blue-800/60 leading-snug flex items-start gap-1">
          <Tag size={11} className="mt-0.5 shrink-0 text-km0-blue-800/50" />
          <span>{promo.conditions}</span>
        </p>
      ) : null}
    </motion.article>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const Premis = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const isAuthed = !!user
  const { points: userPoints, setPoints } = useUserPoints()
  const { rewards, loading, error } = useHomeRewards()
  const {
    promotions,
    loading: promosLoading,
    error: promosError,
  } = useShopPromotions()
  const { emojiFor } = useShopCategories()

  const [redeeming, setRedeeming] = useState<Reward | null>(null)
  const [promoCategory, setPromoCategory] = useState('totes')
  const [promoFilterOpen, setPromoFilterOpen] = useState(false)

  const [searchParams] = useSearchParams()
  const initialTab: TopTab =
    searchParams.get('tab') === 'promos' ? 'promos' : 'rewards'
  const [topTab, setTopTab] = useState<TopTab>(initialTab)
  const [filter, setFilter] = useState<RewardCategory>('balance')

  const categories = useMemo<RewardCategory[]>(() => {
    const present = new Set(rewards.map((r) => r.category))
    return CATEGORY_ORDER.filter((c) => present.has(c))
  }, [rewards])

  useEffect(() => {
    if (categories.length === 0) return
    if (!categories.includes(filter)) {
      setFilter(categories.includes('balance') ? 'balance' : categories[0])
    }
  }, [categories, filter])

  const filtered = useMemo(
    () => rewards.filter((r) => r.category === filter),
    [rewards, filter]
  )

  const promoCategories = useMemo<CategoriaAdherit[]>(() => {
    const counts = new Map<string, number>()
    for (const p of promotions) {
      const seen = new Set(p.shopCategories)
      for (const slug of seen) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1)
      }
    }
    const rows: CategoriaAdherit[] = [
      {
        slug: 'totes',
        nom: {
          ca: t('merchants.filter_all', 'ca'),
          es: t('merchants.filter_all', 'es'),
        },
        count: promotions.length,
        emoji: '🗂️',
      },
    ]
    for (const slug of SHOP_CATEGORY_ORDER) {
      const count = counts.get(slug) ?? 0
      if (count === 0) continue
      const key = SHOP_CATEGORY_KEY[slug]
      rows.push({
        slug,
        nom: {
          ca: key ? t(key, 'ca') : slug,
          es: key ? t(key, 'es') : slug,
        },
        count,
        emoji: emojiFor(slug),
      })
    }
    // Slugs desconocidos presentes en datos
    for (const [slug, count] of counts) {
      if (
        SHOP_CATEGORY_ORDER.includes(
          slug as (typeof SHOP_CATEGORY_ORDER)[number]
        )
      ) {
        continue
      }
      if (rows.some((r) => r.slug === slug)) continue
      rows.push({
        slug,
        nom: { ca: slug, es: slug },
        count,
        emoji: emojiFor(slug),
      })
    }
    return rows
  }, [promotions, emojiFor])

  useEffect(() => {
    if (promoCategories.length === 0) return
    if (!promoCategories.some((c) => c.slug === promoCategory)) {
      setPromoCategory('totes')
    }
  }, [promoCategories, promoCategory])

  const filteredPromotions = useMemo(() => {
    if (promoCategory === 'totes') return promotions
    return promotions.filter((p) => p.shopCategories.includes(promoCategory))
  }, [promotions, promoCategory])

  const selectedPromoCat = promoCategories.find((c) => c.slug === promoCategory)
  const selectedPromoLabel =
    selectedPromoCat?.nom[lang === 'en' ? 'es' : lang] ??
    t('merchants.filter_all', lang)

  const displayPoints = isAuthed ? userPoints : 0

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
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

          <section className="shrink-0 px-4 pb-2">
            {isAuthed ? (
              <div className="flex items-center gap-2 rounded-full bg-white border border-km0-blue-100 px-3 py-1.5 w-fit">
                <Coins size={14} className="text-km0-yellow-500" />
                <span className="font-ui font-bold text-xs text-km0-blue-900">
                  {t('rewards.balance_label', lang).replace(
                    '{n}',
                    fmt(displayPoints)
                  )}
                </span>
              </div>
            ) : (
              <p className="font-ui font-bold text-xs text-km0-coral-400">
                {t('rewards.guest_label', lang)}
              </p>
            )}
          </section>

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

          {topTab === 'rewards' && categories.length > 0 && (
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
            <div className="shrink-0 px-4 pb-2 space-y-2">
              <p className="font-body text-[11px] text-km0-blue-800/60 leading-snug">
                {t('rewards.promos.info', lang)}
              </p>
              {promoCategories.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPromoFilterOpen(true)}
                  className="w-full min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-km0-blue-100 shadow-sm active:scale-[0.99] transition-transform"
                  aria-haspopup="dialog"
                  aria-expanded={promoFilterOpen}
                >
                  <span className="text-km0-blue-700" aria-hidden>
                    <Store size={16} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 min-w-0 truncate text-left font-ui text-sm text-km0-blue-900 font-bold">
                    {selectedPromoLabel}
                  </span>
                  <ChevronDown
                    size={16}
                    className="text-km0-blue-700 shrink-0"
                  />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-1 pb-6">
            {topTab === 'rewards' ? (
              loading ? (
                <div className="h-full flex items-center justify-center text-center px-6">
                  <p className="font-body text-sm text-km0-blue-800/60">
                    {t('common.loading', lang)}
                  </p>
                </div>
              ) : error || filtered.length === 0 ? (
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
                      points={displayPoints}
                      index={i}
                      isAuthed={isAuthed}
                      onRedeem={setRedeeming}
                      onNeedLogin={() => navigate('/login')}
                    />
                  ))}
                </div>
              )
            ) : promosLoading ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('common.loading', lang)}
                </p>
              </div>
            ) : promosError || filteredPromotions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('rewards.promos.empty', lang)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredPromotions.map((promo, i) => (
                  <PromoCard key={promo.id} promo={promo} index={i} />
                ))}
              </div>
            )}
          </div>

          <CategoryFilterSheet
            open={promoFilterOpen}
            onOpenChange={setPromoFilterOpen}
            categories={promoCategories}
            selected={promoCategory}
            onSelect={setPromoCategory}
            lang={lang}
          />

          {isAuthed && redeeming && redeeming.category === 'balance' && (
            <RedeemBalanceOverlay
              reward={redeeming}
              currentPoints={userPoints}
              onClose={() => setRedeeming(null)}
              onConfirmed={({ costPoints }) =>
                setPoints(Math.max(0, userPoints - costPoints))
              }
            />
          )}
          {isAuthed && redeeming && redeeming.category !== 'balance' && (
            <RedeemMerchandiseOverlay
              reward={redeeming}
              currentPoints={userPoints}
              onClose={() => setRedeeming(null)}
              onConfirmed={({ costPoints }) =>
                setPoints(Math.max(0, userPoints - costPoints))
              }
            />
          )}
        </div>
      </div>
    </DeviceShell>
  )
}

export default Premis
