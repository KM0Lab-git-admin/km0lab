import type { Town, ScopedItem } from '@km0lab/app'
import {
  useNotificationsPanel,
  useLocationContext,
  useDragScroll,
  useTerritory,
  useScopeNews,
  usePreviewState,
  filterScopeTown,
  visibleHomeNews,
  t,
  tf,
  type Lang,
  type Noticia,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import FilterChip from '@/components/FilterChip'
import HomeHero from '@/components/HomeHero'
import NoticiaCard, { formatNewsDate } from '@/components/NoticiaCard'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import ScreenStatus from '@/components/ScreenStatus'
import ScreenTitle from '@/components/ScreenTitle'
import SectionHeader from '@/components/SectionHeader'
import { TownTag } from '@/components/TownTag'
import { useLang } from '@/contexts/LangContext'

/* ─── Detalle ───────────────────────────────────────────────── */
const NoticiaDetail = ({
  noticia,
  lang,
  onBack,
  origin,
}: {
  noticia: Noticia
  lang: Lang
  onBack: () => void
  origin?: Town
}) => {
  const titulo = noticia.titulo[lang]
  const cuerpo = noticia.cuerpo[lang]
  const tags = noticia.tags[lang] ?? []
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex flex-col gap-3 w-full h-full min-h-0"
    >
      <Button
        variant="bubbleSurface"
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 font-ui text-xs text-km0-blue-700 active:scale-95 transition-transform shrink-0"
      >
        <ArrowLeft size={14} />
        {t('common.back', lang)}
      </Button>

      <section className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-4">
        {noticia.imagenUrl && (
          <div className="aspect-[16/9] w-full bg-km0-blue-50 overflow-hidden rounded-2xl mb-3">
            <img
              src={noticia.imagenUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.hidden = true
              }}
            />
          </div>
        )}

        {noticia.fechaPublicacion && (
          <p className="text-[11px] font-ui text-km0-blue-700/70 mb-1">
            {formatNewsDate(noticia.fechaPublicacion, lang)}
            {(origin?.name ?? noticia.ciudad) &&
              ` · ${origin?.name ?? noticia.ciudad}`}
          </p>
        )}

        <h1 className="font-brand text-lg leading-tight text-km0-blue-900 mb-2">
          {titulo}
        </h1>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {cuerpo && (
          <p className="text-xs font-ui text-km0-blue-900/90 whitespace-pre-line leading-relaxed">
            {cuerpo}
          </p>
        )}

        {noticia.fuenteUrl && (
          <a
            href={noticia.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 font-ui text-xs font-bold text-km0-coral-500 underline underline-offset-4 active:scale-95 transition-transform"
          >
            {t('news.detail.source', lang)}
            <ExternalLink size={12} />
          </a>
        )}
      </section>
    </motion.div>
  )
}

/* ─── Página ────────────────────────────────────────────────── */
const Noticias = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useLang()
  const notifications = useNotificationsPanel()
  const { town } = useLocationContext()
  const scrollRef = useDragScroll('vertical')
  const filtersRef = useDragScroll('horizontal')

  const { territory, homeTown, isGrouped } = useTerritory()
  const scope = useScopeNews()
  const [selectedTown, setSelectedTown] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    setSelectedTown(null)
    setExpanded(false)
  }, [territory?.scopeId, territory?.homeTownId])
  const openId = searchParams.get('id')

  const allNews = useMemo(
    () => [...scope.home, ...scope.nearby],
    [scope.home, scope.nearby]
  )
  const visible = filterScopeTown(allNews, selectedTown)
  const { state, retry, isSample } = usePreviewState(
    scope.loading,
    scope.error !== null,
    visible.length === 0
  )
  const load = () => retry(scope.reload)
  const opened = openId
    ? (allNews.find((entry) => entry.item.id === openId) ?? null)
    : null
  const failures =
    territory?.towns.filter(
      (entry) =>
        scope.failedTownIds.includes(entry.id) &&
        (selectedTown === null || entry.id === selectedTown)
    ) ?? []
  const renderCard = (
    { item, town: origin }: ScopedItem<Noticia>,
    showTown = true
  ) => (
    <NoticiaCard
      key={item.id}
      noticia={item}
      lang={lang}
      town={
        isGrouped && showTown
          ? { name: origin.name, isHome: origin.id === homeTown?.id }
          : undefined
      }
      onOpen={() => openNoticia(item.id)}
    />
  )
  const renderFailure = (origin: Town) => (
    <p
      key={origin.id}
      role="status"
      className="font-body text-xs text-muted-foreground"
    >
      {tf('territory.townUnavailable', lang, { town: origin.name })}
    </p>
  )

  const openNoticia = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('id', id)
    setSearchParams(next, { replace: false })
  }

  const closeDetail = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('id')
    setSearchParams(next, { replace: false })
  }

  const content = (
    <div className="flex flex-col gap-3 w-full h-full min-h-0">
      <div className="-mx-4 -mt-2 shrink-0">
        <HomeHero
          cityName={town}
          hasAlerts={notifications.hasUnread}
          onToggleAlerts={notifications.show}
          onBack={() => navigate('/home')}
          backAriaLabel={t('common.back', lang)}
          showGreeting={false}
          greetingSlot={
            <div className="w-full min-w-0">
              <ScreenTitle title={t('news.title', lang)} />
              {isGrouped && (
                <p className="mt-1 font-body text-xs text-km0-blue-800">
                  {tf('territory.townAndNeighbours', lang, {
                    town: homeTown?.name ?? town,
                  })}
                </p>
              )}
            </div>
          }
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {opened && state === 'ready' ? (
          <NoticiaDetail
            key={`detail-${opened.item.id}`}
            noticia={opened.item}
            origin={isGrouped ? opened.town : undefined}
            lang={lang}
            onBack={closeDetail}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {isGrouped && (
              <div
                ref={filtersRef}
                className="flex shrink-0 gap-2 overflow-x-auto touch-pan-x"
              >
                <div className="shrink-0">
                  <FilterChip
                    label={t('territory.allFeminine', lang)}
                    active={selectedTown === null}
                    onClick={() => setSelectedTown(null)}
                  />
                </div>
                {territory?.towns.map((origin) => (
                  <div key={origin.id} className="shrink-0">
                    <FilterChip
                      label={origin.name}
                      active={selectedTown === origin.id}
                      onClick={() => setSelectedTown(origin.id)}
                    />
                  </div>
                ))}
              </div>
            )}
            <motion.section
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-4 space-y-3"
              ref={scrollRef}
            >
              {isSample && (
                <p
                  role="status"
                  className="font-ui text-xs font-bold text-km0-coral-700"
                >
                  {t('territory.sampleContent', lang)}
                </p>
              )}
              <ScreenStatus
                state={state}
                emptyKey="news.empty.title"
                onRetry={load}
              />
              {state !== 'loading' &&
                state !== 'error' &&
                (!isGrouped || selectedTown !== null) && (
                  <>
                    {failures.map(renderFailure)}
                    {state === 'ready' &&
                      visible.map((entry) => renderCard(entry))}
                  </>
                )}
              {state === 'empty' &&
                isGrouped &&
                selectedTown === null &&
                failures.map(renderFailure)}
              {state === 'ready' && isGrouped && selectedTown === null && (
                <>
                  {(scope.home.length > 0 ||
                    failures.some((origin) => origin.id === homeTown?.id)) && (
                    <section className="space-y-3">
                      <SectionHeader
                        title={tf('territory.newsFrom', lang, {
                          town: homeTown?.name ?? town,
                        })}
                        aside={
                          <TownTag
                            townName={homeTown?.name ?? town}
                            isHome
                            lang={lang}
                          />
                        }
                      />
                      {failures
                        .filter((origin) => origin.id === homeTown?.id)
                        .map(renderFailure)}
                      {visibleHomeNews(scope.home, expanded).map((entry) =>
                        renderCard(entry, false)
                      )}
                      {!expanded && scope.home.length > 5 && (
                        <Button
                          variant="bubbleLink"
                          onClick={() => setExpanded(true)}
                        >
                          {tf('territory.moreNewsFrom', lang, {
                            town: homeTown?.name ?? town,
                          })}
                        </Button>
                      )}
                    </section>
                  )}
                  {(scope.nearby.length > 0 ||
                    failures.some((origin) => origin.id !== homeTown?.id)) && (
                    <section className="space-y-3">
                      <SectionHeader title={t('territory.nearYou', lang)} />
                      {failures
                        .filter((origin) => origin.id !== homeTown?.id)
                        .map(renderFailure)}
                      {scope.nearby.map((entry) => renderCard(entry))}
                    </section>
                  )}
                </>
              )}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      <div
        ref={notifications.setContainer}
        className="relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 px-4 pt-5">{content}</div>
        <NotificationsOverlay
          open={notifications.open}
          items={notifications.items}
          loading={notifications.loading}
          error={notifications.error}
          lang={lang}
          onClose={notifications.close}
          onReload={notifications.reload}
          container={notifications.container}
        />
      </div>
    </>
  )
}
export default Noticias
