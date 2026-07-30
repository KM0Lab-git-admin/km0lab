import { t, useAppStore } from '@km0lab/app'
import { Check, History, Home } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'

/**
 * ScannerSuccess — Confirmació de punts tras escanejar un QR vàlid.
 * Rep dades via `location.state` (comercNom, puntsGuanyats, totalPunts)
 * des de `Scanner`. Actualitza el saldo del store per si s'hi entra directe.
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
  const setUserPoints = useAppStore((s) => s.setUserPoints)
  const data = (state ?? {}) as SuccessState

  useEffect(() => {
    if (typeof data.totalPunts === 'number') {
      setUserPoints(data.totalPunts)
    }
  }, [data.totalPunts, setUserPoints])

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
        {typeof data.totalPunts === 'number' && (
          <p className="font-ui text-sm text-km0-blue-900/60">
            {t('scanner.success.total', lang).replace(
              '{n}',
              String(data.totalPunts)
            )}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 w-full max-w-[280px]">
          <button
            type="button"
            onClick={() => navigate('/points-history')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-km0-blue-900 text-white font-ui font-bold text-sm px-6 py-3 hover:bg-km0-blue-800 transition-colors"
          >
            <History size={16} strokeWidth={2.4} />
            {t('scanner.confirmation.history', lang)}
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-km0-yellow-400 text-km0-blue-900 font-ui font-bold text-sm px-6 py-3 hover:bg-km0-yellow-300 transition-colors"
          >
            <Home size={16} strokeWidth={2.4} />
            {t('scanner.confirmation.back', lang)}
          </button>
        </div>
      </div>
    </BrandedFrame>
  )
}

export default ScannerSuccess
