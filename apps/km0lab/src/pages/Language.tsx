import { t, type Lang } from '@km0lab/app'
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
  const { lang, setLang } = useLang()
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: Lang) => {
    setSelected(id)
    setLang(id)
    setTimeout(() => navigate('/onboarding'), 300)
  }

  return (
    <BrandedFrame>
      {/* Maqueta ÚNICA portrait, centrada verticalmente en el marco. Con
          min-h-full + justify-center el contenido queda centrado cuando
          cabe y, si algún día no cupiera, el body de BrandedFrame haría
          scroll sin recortar. */}
      <div className="min-h-full w-full max-w-[390px] mx-auto flex flex-col justify-center items-stretch py-4 gap-4">
        {/* Robot */}
        <div className="flex justify-center shrink-0">
          <div className="relative w-[230px] h-[230px] flex items-center justify-center">
            <FloatingDots />
            <div className="relative w-[200px] h-[200px] flex items-center justify-center">
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
          className="flex flex-col gap-2 shrink-0
            [&_button]:!py-2 [&_button]:!gap-3
            [&_button>span:first-child]:!w-10 [&_button>span:first-child]:!h-10
            [&_button>span:first-child>img]:!w-7 [&_button>span:first-child>img]:!h-7
            [&_button_p:first-child]:!text-base
            [&_button_p:last-child]:!text-xs"
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
