import { Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'

/**
 * ScannerSuccess — Placeholder de la pantalla completa de Confirmació
 * de punts (apartat 5). Aquí només mostrem el mínim: la construcció
 * real es fa a l'apartat 5. Rep dades via `location.state` que envia
 * l'escàner en ÈXIT.
 */
interface SuccessState {
  comercId?: string
  comercNom?: string
  puntsGuanyats?: number
  totalPunts?: number
  nivell?: number
}

const ScannerSuccess = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { state } = useLocation()
  const data = (state ?? {}) as SuccessState

  return (
    <BrandedFrame onBack={() => navigate('/home')}>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-km0-yellow-400 flex items-center justify-center">
          <Check size={40} strokeWidth={3} className="text-km0-blue-900" />
        </div>
        <h1 className="font-ui font-bold text-xl text-km0-blue-900">
          {t('scanner.confirmation.title', lang)}
        </h1>
        {data.comercNom && (
          <p className="font-ui text-km0-blue-900/80">
            {data.comercNom} · +{data.puntsGuanyats} {t('common.points', lang)}
          </p>
        )}
        <p className="font-ui text-sm text-km0-blue-900/60 max-w-[280px]">
          {t('scanner.confirmation.placeholder', lang)}
        </p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mt-4 rounded-xl bg-km0-blue-900 text-white font-ui font-bold text-sm px-6 py-3 hover:bg-km0-blue-800 transition-colors"
        >
          {t('scanner.confirmation.back', lang)}
        </button>
      </div>
    </BrandedFrame>
  )
}

export default ScannerSuccess
