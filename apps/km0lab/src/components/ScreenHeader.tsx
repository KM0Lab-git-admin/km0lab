import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLang } from '@/contexts/LangContext'

const ScreenHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate()
  const { lang } = useLang()
  return (
    <header className="grid shrink-0 grid-cols-[40px_1fr_40px] items-center gap-2 bg-km0-yellow-400 px-3 py-3">
      <Button
        variant="bubbleSurface"
        size="icon"
        onClick={() => {
          if (window.history.state?.idx > 0) navigate(-1)
          else navigate('/home')
        }}
        aria-label={t('common.back', lang)}
        className="rounded-full bg-card text-km0-blue-800"
      >
        <ChevronLeft size={20} />
      </Button>
      <h1 className="text-center font-brand text-base font-black leading-snug text-km0-blue-800">
        {title}
      </h1>
      <span aria-hidden />
    </header>
  )
}
export default ScreenHeader
