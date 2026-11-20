import {
  useAccount,
  redeemReward,
  usePreviewState,
  useAuth,
  useDragScroll,
  usePublicRewards,
  t,
  type TKey,
  useShopPromotions,
  ShopPromotion,
  Reward,
  RewardCategory,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import { Package, Tag } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import AccountAccessFlow from '@/components/AccountAccessFlow'
import AccountBottomTabs from '@/components/AccountBottomTabs'
import FilterChip from '@/components/FilterChip'
import RedeemBalanceOverlay from '@/components/RedeemBalanceOverlay'
import RedeemMerchandiseOverlay from '@/components/RedeemMerchandiseOverlay'
import RewardCardFrame from '@/components/RewardCardFrame'
import ScreenHeader from '@/components/ScreenHeader'
import ScreenStatus from '@/components/ScreenStatus'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

type TopTab = 'rewards' | 'promos'
const CATEGORY_KEY: Record<RewardCategory, TKey> = {
  balance: 'rewards.category.balance',
  experience: 'rewards.category.experience',
  merchandising: 'rewards.category.merchandising',
  discount: 'rewards.category.discount',
}
const fmt = (n: number) => n.toLocaleString('es-ES')

/* ─── Tarjeta de promoción de comercio ───────────────────── */
interface PromoCardProps {
  row: ShopPromotion
  index: number
}

const PromoCard = ({ row, index }: PromoCardProps) => {
  const { lang } = useLang()
  const l = lang === 'en' ? 'es' : lang
  const { shopName, shopEmoji, shopImage, shopBg } = row
  const promo = row

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.28) }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card border border-km0-blue-100',
        'shadow-[var(--shadow-bubble)]',
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
        <span className="shrink-0 rounded-full px-2 py-1 text-[11px] font-ui font-black bg-km0-coral-400 text-primary-foreground">
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

const Premis = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const isAuthed = !!user
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const account = useAccount()
  const points = account.balance
  const [redeeming, setRedeeming] = useState<Reward | null>(null)
  const [searchParams] = useSearchParams()
  const [topTab, setTopTab] = useState<TopTab>(
    searchParams.get('tab') === 'promos' ? 'promos' : 'rewards'
  )
  const [filter, setFilter] = useState<'all' | RewardCategory>('all')
  const { rewards, loading, error, reload } = usePublicRewards()
  const scrollRef = useDragScroll('vertical')
  const categories = [...new Set(rewards.map((r) => r.category))]
  const filtered = rewards.filter(
    (r) => filter === 'all' || r.category === filter
  )
  const preview = usePreviewState(loading, error, filtered.length === 0)
  const {
    promotions: promoRows,
    loading: promosLoading,
    error: promosError,
    reload: reloadPromos,
  } = useShopPromotions()
  return (
    <AccountAccessFlow isAuthed={isAuthed} container={container}>
      {(access) => (
        <>
          <div
            ref={setContainer}
            className="relative flex h-full w-full min-h-0 flex-col overflow-hidden bg-km0-beige-50"
          >
            <ScreenHeader title={t('rewards.title', lang)} />
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4"
            >
              <p className="mb-3 font-ui text-sm font-bold text-km0-blue-800">
                {t(
                  isAuthed ? 'rewards.balance_label' : 'rewards.guest_label',
                  lang
                ).replace('{n}', fmt(points))}
              </p>
              {isAuthed && (
                <p className="mb-3 font-body text-[11px] text-muted-foreground">
                  {t('account.demo', lang)}
                </p>
              )}
              <div className="mb-3 flex gap-2">
                {(['rewards', 'promos'] as const).map((tab) => (
                  <FilterChip
                    key={tab}
                    active={topTab === tab}
                    onClick={() => setTopTab(tab)}
                    label={t(
                      tab === 'rewards'
                        ? 'rewards.tab.rewards'
                        : 'rewards.tab.promos',
                      lang
                    )}
                  />
                ))}
              </div>
              {topTab === 'rewards' ? (
                <>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <FilterChip
                      active={filter === 'all'}
                      onClick={() => setFilter('all')}
                      label={t('rewards.filter_all', lang)}
                    />
                    {categories.map((c) => (
                      <FilterChip
                        key={c}
                        active={filter === c}
                        onClick={() => setFilter(c)}
                        label={t(CATEGORY_KEY[c], lang)}
                      />
                    ))}
                  </div>
                  {preview.state !== 'ready' ? (
                    <ScreenStatus
                      state={preview.state}
                      emptyKey="rewards.empty"
                      onRetry={() => preview.retry(reload)}
                    />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filtered.map((reward) => {
                        const available =
                          reward.status === 'active' && reward.stock !== 0
                        const missing = Math.max(0, reward.costPoints - points)
                        const label = !available
                          ? 'rewards.status.sold_out'
                          : !isAuthed
                            ? 'rewards.cta.locked_guest'
                            : missing
                              ? 'rewards.status.missing_points'
                              : 'rewards.cta.redeem'
                        return (
                          <RewardCardFrame
                            key={reward.id}
                            title={reward.title}
                            description={reward.description}
                            kind={reward.kind}
                            imageUrl={reward.imageUrl}
                            points={reward.costPoints}
                            badge={
                              <span className="rounded-full bg-card px-3 py-1 font-ui text-[10px] font-bold text-km0-blue-800">
                                {t(
                                  available
                                    ? 'rewards.status.active'
                                    : 'rewards.status.sold_out',
                                  lang
                                )}
                              </span>
                            }
                          >
                            <div className="grid grid-cols-2 gap-3 font-ui text-xs text-km0-blue-800">
                              <div>
                                <p className="text-km0-blue-800/60">
                                  {t('rewards.value', lang)}
                                </p>
                                <p className="mt-1 font-bold">
                                  {reward.valueLabel}
                                </p>
                              </div>
                              <div>
                                <p className="text-km0-blue-800/60">
                                  {t('rewards.stock', lang)}
                                </p>
                                <p className="mt-1 flex items-center gap-1 font-bold">
                                  <Package size={12} />
                                  {reward.stock === null
                                    ? t('rewards.stock_unlimited', lang)
                                    : t('rewards.stock_units', lang).replace(
                                        '{n}',
                                        String(reward.stock)
                                      )}
                                </p>
                              </div>
                            </div>
                            <p className="font-body text-xs text-km0-blue-800/60">
                              {reward.scope}
                            </p>
                            <Button
                              variant="bubblePrimary"
                              disabled={
                                !available ||
                                (isAuthed &&
                                  (missing > 0 ||
                                    account.loading ||
                                    !!account.error))
                              }
                              onClick={() =>
                                isAuthed
                                  ? setRedeeming(reward)
                                  : access.open('rewards')
                              }
                              className="h-auto min-h-11 whitespace-normal"
                            >
                              {t(label, lang).replace('{n}', fmt(missing))}
                            </Button>
                          </RewardCardFrame>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="font-body text-xs text-km0-blue-800/60">
                    {t('rewards.promos.info', lang)}
                  </p>
                  {promosLoading || promosError ? (
                    <ScreenStatus
                      state={promosLoading ? 'loading' : 'error'}
                      emptyKey="rewards.promos.empty"
                      onRetry={reloadPromos}
                    />
                  ) : promoRows.length ? (
                    promoRows.map((row, index) => (
                      <PromoCard
                        key={`${row.shopId}-${row.id}`}
                        row={row}
                        index={index}
                      />
                    ))
                  ) : (
                    <p>{t('rewards.promos.empty', lang)}</p>
                  )}
                </div>
              )}
            </div>
            <AccountBottomTabs
              activeTab={null}
              isAuthed={isAuthed}
              onLogin={access.open}
              onHome={() => navigate('/home')}
              onActions={() => navigate('/points-actions')}
              onPoints={() => navigate('/points-history')}
              onRewards={() => navigate('/redeemed-rewards')}
              onProfile={() => navigate('/profile')}
            />
            {redeeming &&
              (redeeming.category === 'balance' ? (
                <RedeemBalanceOverlay
                  reward={redeeming}
                  currentPoints={points}
                  container={container}
                  onClose={() => setRedeeming(null)}
                  onConfirmed={() => redeemReward(redeeming)}
                />
              ) : (
                <RedeemMerchandiseOverlay
                  reward={redeeming}
                  currentPoints={points}
                  container={container}
                  onClose={() => setRedeeming(null)}
                  onConfirmed={() => redeemReward(redeeming)}
                />
              ))}
          </div>
        </>
      )}
    </AccountAccessFlow>
  )
}
export default Premis
