import { t, useAppStore, type Lang } from '@km0lab/app'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import flagCa from '@/assets/flags/flag-ca.svg'
import flagEn from '@/assets/flags/flag-en.svg'
import flagEs from '@/assets/flags/flag-es.svg'
import robotPlaceholder from '@/assets/km0_robot_icon_v2.png'
import BrandedFrame from '@/components/BrandedFrame'
import FloatingDots from '@/components/FloatingDots'
import LanguageCard from '@/components/LanguageCard'
import { useLang } from '@/contexts/LangContext'

const languages: {
  id: Lang
  flag: string
  flagIsImage?: boolean
  name: string
  description: string
  disabled?: boolean
}[] = [
  {
    id: 'ca',
    flag: flagCa,
    flagIsImage: true,
    name: 'Català',
    description: 'Comença en català',
  },
  {
    id: 'es',
    flag: flagEs,
    flagIsImage: true,
    name: 'Español',
    description: 'Empieza en español',
  },
  {
    id: 'en',
    flag: flagEn,
    flagIsImage: true,
    name: 'English',
    description: 'Start in English',
  },
]

const Language = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const chooseLang = useAppStore((s) => s.chooseLang)
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: Lang) => {
    setSelected(id)
    chooseLang(id)
    setTimeout(() => navigate('/onboarding'), 300)
  }

  return (
    <BrandedFrame>
      {/* ── PORTRAIT body ───────────────────────────────── */}
      <div className="landscape:hidden flex-1 min-h-0 w-full max-w-[390px] sm:max-w-[560px] mx-auto flex flex-col justify-start items-stretch pt-2 pb-4 sm:py-4 gap-4 sm:gap-6">
        {/* Robot */}
        <div className="flex justify-center shrink-0">
          <div className="relative w-[230px] h-[230px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
            <FloatingDots />
            <div className="relative w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-km0-teal-400/25 border-2 border-km0-blue-700" />
              <div className="absolute inset-[14%] rounded-full bg-km0-teal-500/90" />
              <img
                src={robotPlaceholder}
                alt="KM0 LAB mascot"
                className="relative z-10 h-[70%] w-auto object-contain animate-float drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-2 sm:gap-4 shrink-0
            [&_button]:!py-2 [&_button]:!gap-3
            [&_button>span:first-child]:!w-10 [&_button>span:first-child]:!h-10
            [&_button>span:first-child>img]:!w-7 [&_button>span:first-child>img]:!h-7
            [&_button_p:first-child]:!text-base
            [&_button_p:last-child]:!text-xs
            sm:[&_button]:!py-5 sm:[&_button]:!gap-4
            sm:[&_button>span:first-child]:!w-14 sm:[&_button>span:first-child]:!h-14
            sm:[&_button>span:first-child>img]:!w-11 sm:[&_button>span:first-child>img]:!h-11
            sm:[&_button_p:first-child]:!text-xl
            sm:[&_button_p:last-child]:!text-base"
        >
          {languages.map((langOpt, i) => (
            <LanguageCard
              key={langOpt.id}
              flag={langOpt.flag}
              flagIsImage={langOpt.flagIsImage}
              name={langOpt.name}
              description={langOpt.description}
              selected={selected === langOpt.id}
              disabled={langOpt.disabled}
              onClick={() => handleSelect(langOpt.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* ── LANDSCAPE body ──────────────────────────────── */}
      <div className="hidden landscape:flex flex-1 min-h-0 w-full items-stretch">
        <div className="flex-1 relative flex items-center justify-center pr-6 horizontal-mobile:pr-4">
          <FloatingDots />
          <div className="relative aspect-square h-full max-h-[min(70%,360px)] horizontal-mobile:max-h-[60%] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-km0-teal-400/25 border-2 border-km0-blue-700" />
            <div className="absolute inset-[14%] rounded-full bg-km0-teal-500/90" />
            <img
              src={robotPlaceholder}
              alt="KM0 LAB mascot"
              className="relative z-10 h-[70%] w-auto object-contain animate-float drop-shadow-lg"
            />
          </div>
        </div>

        <div className="w-px bg-km0-yellow-500/60 self-stretch mx-2 horizontal-mobile:mx-1" />

        <div
          className="flex-1 flex flex-col justify-center gap-3 horizontal-mobile:gap-2 pl-6 horizontal-mobile:pl-4
            [&_button]:py-3 horizontal-mobile:[&_button]:py-2
            [&_button]:px-4 horizontal-mobile:[&_button]:px-3
            [&_button>span:first-child]:w-11 [&_button>span:first-child]:h-11
            horizontal-mobile:[&_button>span:first-child]:w-9 horizontal-mobile:[&_button>span:first-child]:h-9
            [&_button>span:first-child>img]:w-9 [&_button>span:first-child>img]:h-9
            horizontal-mobile:[&_button>span:first-child>img]:w-7 horizontal-mobile:[&_button>span:first-child>img]:h-7
            [&_button_p:first-child]:text-lg
            horizontal-mobile:[&_button_p:first-child]:text-base
            [&_button_p:last-child]:text-sm
            horizontal-mobile:[&_button_p:last-child]:text-xs"
        >
          {languages.map((langOpt, i) => (
            <LanguageCard
              key={langOpt.id}
              flag={langOpt.flag}
              flagIsImage={langOpt.flagIsImage}
              name={langOpt.name}
              description={langOpt.description}
              selected={selected === langOpt.id}
              disabled={langOpt.disabled}
              onClick={() => handleSelect(langOpt.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </BrandedFrame>
  )
}

export default Language
