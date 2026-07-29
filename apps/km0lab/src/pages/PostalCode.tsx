import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, MapPinOff, AlertTriangle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BrandedFrame from '@/components/BrandedFrame'
import cityMap from '@/assets/km0_city_map.png'
import { lookupTown } from '@km0lab/app'
import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'

const PostalCode = () => {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<
    'idle' | 'found' | 'not_found'
  >('idle')
  const [resolvedTown, setResolvedTown] = useState<string | null>(null)

  const isNumeric = /^\d*$/.test(value)
  const isComplete = value.length === 5 && isNumeric
  const cityName = validationResult === 'found' ? resolvedTown : null
  const showError = touched && !isNumeric
  const showNotFound = validationResult === 'not_found'

  useEffect(() => {
    if (!isComplete) {
      setIsValidating(false)
      setValidationResult('idle')
      setResolvedTown(null)
      return
    }
    let cancelled = false
    setIsValidating(true)
    setValidationResult('idle')
    lookupTown(value).then((town) => {
      if (cancelled) return
      setIsValidating(false)
      setResolvedTown(town)
      setValidationResult(town ? 'found' : 'not_found')
    })
    return () => {
      cancelled = true
    }
  }, [value, isComplete])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (!touched) setTouched(true)
  }

  const handleSubmit = () => {
    if (!isComplete || !cityName) return
    // localStorage para que sobreviva recargas y se pueda leer desde Home/Login.
    try {
      localStorage.setItem('km0_postal_code', value)
      localStorage.setItem('km0_town', cityName)
    } catch {
      /* localStorage puede fallar en modo privado */
    }
    navigate('/home')
  }

  return (
    <BrandedFrame
      onBack={() => navigate(-1)}
      backAriaLabel={t('common.back', lang)}
    >
      {/* Maqueta ÚNICA portrait, centrada verticalmente en el marco. */}
      <div className="w-full max-w-[390px] mx-auto flex flex-col gap-6 vertical-mobile:gap-7 min-h-full justify-center py-4">
        <motion.div
          className="rounded-3xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <img
            src={cityMap}
            alt="Isometric city map"
            className="w-full h-auto object-cover"
          />
        </motion.div>

        <motion.div
          className="text-center px-2 min-h-[52px] flex items-center justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {cityName ? (
            <motion.div
              key="city"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full px-2"
            >
              <h1 className="font-brand font-medium text-xl vertical-mobile:text-2xl text-km0-teal-600 leading-tight text-center break-words">
                <span className="mr-1">📍</span>
                {cityName}
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-brand font-bold text-2xl text-primary leading-tight mb-2 vertical-mobile:mb-3">
                {t('postal.title', lang)}
              </h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {t('postal.subtitle', lang)}
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="flex flex-col gap-2 px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition-colors ${
              showNotFound || showError
                ? 'bg-destructive/5 border-destructive/50 focus-within:border-destructive'
                : 'bg-white border-km0-beige-200 focus-within:border-km0-teal-400'
            }`}
          >
            {showNotFound || showError ? (
              <MapPinOff className="text-destructive shrink-0" size={22} />
            ) : (
              <MapPin className="text-km0-teal-500 shrink-0" size={22} />
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder={t('postal.placeholder', lang)}
              value={value}
              onChange={handleChange}
              className="flex-1 bg-transparent font-ui text-lg text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>
          {showError && (
            <div className="flex items-center gap-1.5 text-destructive font-ui text-sm px-1">
              <AlertTriangle size={14} />
              <span>{t('postal.error_numeric', lang)}</span>
            </div>
          )}
          <AnimatePresence>
            {showNotFound && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 text-destructive font-ui text-sm px-1"
              >
                <AlertTriangle size={14} />
                <span>{t('postal.error_notfound', lang)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <button
            onClick={handleSubmit}
            disabled={!cityName || isValidating}
            className="w-full bg-primary text-primary-foreground font-ui font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              t('common.continue', lang)
            )}
          </button>
        </motion.div>
      </div>
    </BrandedFrame>
  )
}

export default PostalCode
