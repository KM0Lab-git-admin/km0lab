import { t, useAppStore, type Lang } from '@km0lab/app'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import LegalText from '@/components/LegalText'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/*
 * De producción (candado en el manifest): no existe en Lovable.
 *
 * Las dos páginas legales, `/condicions` y `/privacitat`. Son públicas: se
 * leen sin sesión y sin haber elegido pueblo (a `/privacitat` enlaza la
 * ficha de la tienda de aplicaciones). El texto es de Legal y llega como
 * contenido, un fichero por idioma en `src/content/legal`; aquí no hay
 * ninguna frase suya.
 */
export type LegalDoc = 'condicions' | 'privacitat'

const TITLE = {
  condicions: 'legal.terms.title',
  privacitat: 'legal.privacy.title',
} as const

const LANGS: Lang[] = ['ca', 'es', 'en']

// Cada texto se descarga solo cuando se abre su página, en su idioma.
const files = import.meta.glob<string>('../content/legal/*.md', {
  query: '?raw',
  import: 'default',
})

const Legal = ({ doc }: { doc: LegalDoc }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const setLang = useAppStore((s) => s.setLang)
  const [source, setSource] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setSource(null)
    setFailed(false)
    const load = files[`../content/legal/${doc}.${lang}.md`]
    if (!load) {
      setFailed(true)
      return
    }
    load()
      .then((text) => {
        if (!cancelled) setSource(text)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [doc, lang])

  // `/condicions#comercos` lleva al apartado de comercios.
  useEffect(() => {
    if (!source || !location.hash) return
    document
      .getElementById(location.hash.slice(1))
      ?.scrollIntoView({ block: 'start' })
  }, [source, location.hash])

  return (
    <BrandedFrame
      onBack={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
      backAriaLabel={t('common.back', lang)}
    >
      <article className="mx-auto w-full max-w-[390px] pb-8">
        <div
          role="group"
          aria-label={t('language.title', lang)}
          className="mb-3 flex justify-end gap-1"
        >
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={code === lang}
              onClick={() => setLang(code)}
              className={cn(
                'rounded-full px-2.5 py-1 font-ui text-xs font-semibold uppercase',
                code === lang
                  ? 'bg-km0-blue-700 text-primary-foreground'
                  : 'bg-card text-km0-blue-700'
              )}
            >
              {code}
            </button>
          ))}
        </div>
        <h1 className="mb-4 font-brand text-2xl text-km0-blue-700">
          {t(TITLE[doc], lang)}
        </h1>
        {failed ? (
          <p role="alert" className="font-body text-sm text-destructive">
            {t('legal.error', lang)}
          </p>
        ) : source === null ? (
          <Loader2
            className="mx-auto animate-spin text-km0-blue-700"
            aria-label={t('common.loading', lang)}
          />
        ) : (
          <LegalText source={source} />
        )}
      </article>
    </BrandedFrame>
  )
}

export default Legal
