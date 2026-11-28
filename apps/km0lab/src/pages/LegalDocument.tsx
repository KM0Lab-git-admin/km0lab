import { useDragScroll, useLegalDocument, t } from '@km0lab/app'
import { Button, Skeleton } from '@km0lab/ui'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { LegalDocumentId } from '@km0lab/app'
import type { Location } from 'react-router-dom'

import LegalDocumentView from '@/components/LegalDocumentView'
import ScreenHeader from '@/components/ScreenHeader'
import { useLang } from '@/contexts/LangContext'

interface LegalDocumentProps {
  documentId: LegalDocumentId
}

interface LegalLocationState {
  backgroundLocation?: Location
}

const LegalDocument = ({ documentId }: LegalDocumentProps) => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const { document, loading, error } = useLegalDocument(documentId)
  const scrollRef = useDragScroll('vertical')
  const title = t(
    documentId === 'conditions'
      ? 'legal.conditions.title'
      : 'legal.privacy.title',
    lang
  )
  const hasBackground = Boolean(
    (location.state as LegalLocationState | null)?.backgroundLocation
  )
  const back = () => {
    if (hasBackground || (window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate('/login')
  }

  useEffect(() => {
    if (!document || !location.hash) return
    const anchor = decodeURIComponent(location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      globalThis.document.getElementById(anchor)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [document, location.hash])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-km0-beige-50">
      <ScreenHeader
        title={title}
        onBack={back}
        backAriaLabel={t('common.back', lang)}
      />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        {loading ? (
          <div aria-busy className="space-y-4 px-5 py-6">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <p className="font-body text-xs text-muted-foreground">
              {t('common.loading', lang)}
            </p>
          </div>
        ) : error || !document || document.sections.length === 0 ? (
          <div
            role={error ? 'alert' : 'status'}
            className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center"
          >
            <p className="font-body text-sm leading-6 text-km0-blue-800">
              {t(error ? 'legal.error' : 'legal.empty', lang)}
            </p>
            <Button variant="bubblePrimary" onClick={back}>
              {t('common.back', lang)}
            </Button>
          </div>
        ) : (
          <LegalDocumentView
            content={document}
            showPlatformNotice={documentId === 'privacy'}
          />
        )}
      </div>
    </div>
  )
}

export default LegalDocument
