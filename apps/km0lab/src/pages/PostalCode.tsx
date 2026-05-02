import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, MapPin, MapPinOff } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import cityMap from '@/assets/images/km0-city-map.png'
import BrandedFrame from '@/components/BrandedFrame'

type Lang = 'ca' | 'es' | 'en'

const i18n = {
  ca: {
    title: 'INTRODUEIX EL TEU CODI POSTAL',
    subtitle: 'Descobreix comerços i serveis al teu barri',
    placeholder: '08001',
    error: 'Només es permeten números',
    notFound: 'No es reconeix aquest codi postal',
    cta: 'CONTINUAR',
  },
  es: {
    title: 'INTRODUCE TU CÓDIGO POSTAL',
    subtitle: 'Descubre comercios y servicios en tu barrio',
    placeholder: '08001',
    error: 'Solo se permiten números',
    notFound: 'No se reconoce este código postal',
    cta: 'CONTINUAR',
  },
  en: {
    title: 'ENTER YOUR POSTAL CODE',
    subtitle: 'Discover shops and services in your neighborhood',
    placeholder: '08001',
    error: 'Only numbers are allowed',
    notFound: 'This postal code is not recognized',
    cta: 'CONTINUE',
  },
}

const postalCodes: Record<string, string> = {
  '08001': 'Barcelona',
  '08380': 'Malgrat de Mar',
  '08301': 'Mataró',
  '08400': 'Granollers',
  '08201': 'Sabadell',
  '08221': 'Terrassa',
  '08800': 'Vilanova i la Geltrú',
  '08850': 'Gavà',
  '08901': "L'Hospitalet de Llobregat",
  '08940': 'Cornellà de Llobregat',
}

const PostalCode = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const lang: Lang = (location.state?.lang as Lang) ?? 'es'
  const t = i18n[lang]

  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<
    'idle' | 'found' | 'not_found'
  >('idle')

  const isNumeric = /^\d*$/.test(value)
  const isComplete = value.length === 5 && isNumeric
  const cityName =
    validationResult === 'found' ? (postalCodes[value] ?? null) : null
  const showError = touched && !isNumeric
  const showNotFound = validationResult === 'not_found'

  useEffect(() => {
    if (isComplete) {
      setIsValidating(true)
      setValidationResult('idle')
      const timer = setTimeout(() => {
        setIsValidating(false)
        setValidationResult(postalCodes[value] ? 'found' : 'not_found')
      }, 1200)
      return () => clearTimeout(timer)
    } else {
      setIsValidating(false)
      setValidationResult('idle')
    }
  }, [value, isComplete])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (!touched) setTouched(true)
  }

  const handleSubmit = () => {
    if (!isComplete || !cityName) return
    navigate('/chat', { state: { lang, cityName, postalCode: value } })
  }

  return (
    <BrandedFrame onBack={() => navigate(-1)} backAriaLabel="Back">
      {/* ── PORTRAIT ─────────────────────────────────────── */}
      <div className="w-full max-w-[390px] sm:max-w-[460px] mx-auto flex flex-col gap-6 vertical-mobile:gap-7 landscape:hidden flex-1 min-h-0 py-2">
        {/* City illustration */}
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

        {/* Title / City name */}
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
                {t.title}
              </h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {t.subtitle}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Input */}
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
              placeholder={t.placeholder}
              value={value}
              onChange={handleChange}
              className="flex-1 bg-transparent font-ui text-lg text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>
          {showError && (
            <div className="flex items-center gap-1.5 text-destructive font-ui text-sm px-1">
              <AlertTriangle size={14} />
              <span>{t.error}</span>
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
                <span>{t.notFound}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
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
              t.cta
            )}
          </button>
        </motion.div>
      </div>

      {/* ── LANDSCAPE ────────────────────────────────────── */}
      <div className="hidden landscape:flex flex-1 min-h-0 w-full items-stretch gap-4 horizontal-desktop:gap-8">
        {/* Left: city image */}
        <motion.div
          className="basis-[42%] shrink-0 min-w-0 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-km0-beige-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <img
            src={cityMap}
            alt="Isometric city map"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Right: title + input + CTA */}
        <motion.div
          className="flex-1 min-w-0 flex flex-col justify-center gap-3 horizontal-desktop:gap-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="text-center min-h-[44px] horizontal-desktop:min-h-[60px] flex items-center justify-center">
            {cityName ? (
              <motion.div
                key="city-ls"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="font-brand font-medium text-xl horizontal-desktop:text-3xl text-km0-teal-600 leading-tight">
                  📍 {cityName}
                </h1>
              </motion.div>
            ) : (
              <motion.div
                key="default-ls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-brand font-bold text-base horizontal-desktop:text-2xl text-primary leading-tight mb-0.5 horizontal-desktop:mb-1">
                  {t.title}
                </h1>
                <p className="font-body text-xs horizontal-desktop:text-sm text-muted-foreground leading-snug">
                  {t.subtitle}
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div
              className={`flex items-center gap-2 horizontal-desktop:gap-3 rounded-2xl border px-3 horizontal-desktop:px-4 py-2.5 horizontal-desktop:py-3.5 shadow-sm transition-colors ${
                showNotFound || showError
                  ? 'bg-destructive/5 border-destructive/50 focus-within:border-destructive'
                  : 'bg-white border-km0-beige-200 focus-within:border-km0-teal-400'
              }`}
            >
              {showNotFound || showError ? (
                <MapPinOff className="text-destructive shrink-0" size={20} />
              ) : (
                <MapPin className="text-km0-teal-500 shrink-0" size={20} />
              )}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder={t.placeholder}
                value={value}
                onChange={handleChange}
                className="flex-1 min-w-0 bg-transparent font-ui text-base horizontal-desktop:text-lg text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
            </div>
            {showError && (
              <div className="flex items-center gap-1.5 text-destructive font-ui text-xs px-1">
                <AlertTriangle size={12} />
                <span>{t.error}</span>
              </div>
            )}
            <AnimatePresence>
              {showNotFound && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-destructive font-ui text-xs px-1"
                >
                  <AlertTriangle size={12} />
                  <span>{t.notFound}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!cityName || isValidating}
            className="w-full bg-primary text-primary-foreground font-ui font-semibold text-sm horizontal-desktop:text-base px-5 py-2.5 horizontal-desktop:py-3 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              t.cta
            )}
          </button>
        </motion.div>
      </div>
    </BrandedFrame>
  )
}

export default PostalCode
