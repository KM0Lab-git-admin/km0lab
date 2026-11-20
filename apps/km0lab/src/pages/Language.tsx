import { t, type Lang, type TKey } from '@km0lab/app'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import flagCa from '@/assets/flags/flag-ca.svg'
import flagEn from '@/assets/flags/flag-en.svg'
import flagEs from '@/assets/flags/flag-es.svg'
import languageSelectionAsset from '@/assets/language-selection.png.asset.json'
import BrandedFrame from '@/components/BrandedFrame'
import LanguageCard from '@/components/LanguageCard'
import { useLang } from '@/contexts/LangContext'

interface LanguageOption {
  id: Lang
  flag: string
  nameKey: TKey
  descriptionKey: TKey
}

const languages: LanguageOption[] = [
  {
    id: 'ca',
    flag: flagCa,
    nameKey: 'language.catalan',
    descriptionKey: 'language.catalan_description',
  },
  {
    id: 'es',
    flag: flagEs,
    nameKey: 'language.spanish',
    descriptionKey: 'language.spanish_description',
  },
  {
    id: 'en',
    flag: flagEn,
    nameKey: 'language.english',
    descriptionKey: 'language.english_description',
  },
]

const Language = () => {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const [selected, setSelected] = useState<Lang | null>(null)

  const handleSelect = (id: Lang) => {
    setSelected(id)
    setLang(id)
    setTimeout(() => navigate('/onboarding'), 300)
  }

  return (
    <BrandedFrame portraitContentClassName="!px-0 !pb-0 bg-background">
      <div className="h-full w-full flex flex-col overflow-y-auto overflow-x-hidden bg-background">
        <div className="relative flex-1 min-h-[150px] overflow-hidden">
          <img
            src={languageSelectionAsset.url}
            alt={t('language.image_alt', lang)}
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 -mt-5 shrink-0 rounded-t-3xl bg-km0-beige-100 px-4 pb-8 pt-5 shadow-[0_-12px_30px_-24px_hsl(var(--foreground)/0.35)]">
          <h1
            lang={lang}
            className="mb-1 text-balance text-center font-brand text-2xl font-black text-km0-blue-700"
          >
            {t('language.title', lang)}
          </h1>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            {languages
              .filter((option) => option.id !== lang)
              .map((option, index) => (
                <span key={option.id}>
                  {index > 0 && ' · '}
                  <span lang={option.id}>{t('language.title', option.id)}</span>
                </span>
              ))}
          </p>
          <div className="flex flex-col gap-2 shrink-0">
            {languages.map((langOpt, i) => (
              <LanguageCard
                key={langOpt.id}
                flag={langOpt.flag}
                flagIsImage
                lang={langOpt.id}
                name={t(langOpt.nameKey, lang)}
                description={t(langOpt.descriptionKey, lang)}
                selected={selected === langOpt.id}
                onClick={() => handleSelect(langOpt.id)}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </BrandedFrame>
  )
}

export default Language
