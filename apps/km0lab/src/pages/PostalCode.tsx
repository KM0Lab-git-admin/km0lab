import {
  DEMO_POSTAL_CODE,
  DEMO_TOWN_NAME,
  isDemoPostalCode,
  leaveDemo,
  lookupTown,
  t,
  updateProfile,
  useAppStore,
  useTerritoryFor,
  useTownChoices,
  type TownChoice,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MapPin, MapPinOff, AlertTriangle, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import postalCodeMapAsset from '@/assets/postal-code-map.png.asset.json'
import BrandedFrame from '@/components/BrandedFrame'
import BubbleSheet from '@/components/BubbleSheet'
import LeaveDemoSheet from '@/components/LeaveDemoSheet'
import TownArt from '@/components/TownArt'
import TownChoiceList from '@/components/TownChoiceList'
import { TownTag } from '@/components/TownTag'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

const PostalCode = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const setLocation = useAppStore((s) => s.setLocation)
  const setShowcase = useAppStore((s) => s.setShowcase)

  const [value, setValue] = useState(DEMO_POSTAL_CODE)
  const [touched, setTouched] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<
    'idle' | 'found' | 'not_found' | 'error'
  >('idle')
  const [resolvedTown, setResolvedTown] = useState<string | null>(null)

  // Demostración (porte de los commits 93cd73f y 926e8c7 de Lovable): el
  // 00000 no es un pueblo, abre la lista de poblaciones y agrupaciones que
  // da la API. El 00000 que se ve gris al entrar es solo una pista: la
  // lista se abre cuando lo escribe la persona.
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState<TownChoice | null>(null)
  const [frame, setFrame] = useState<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Cuenta de demostración que teclea un pueblo real: se pregunta antes.
  const [leaving, setLeaving] = useState<{
    town: string
    postalCode: string
  } | null>(null)
  const [leaveBusy, setLeaveBusy] = useState(false)
  // Se pide al abrir la pantalla: al teclear el código la lista ya está.
  const townChoices = useTownChoices()

  const isNumeric = /^\d*$/.test(value)
  const isChoiceCode = touched && value === DEMO_POSTAL_CODE
  const isComplete = value.length === 5 && isNumeric && !isChoiceCode
  const cityName = validationResult === 'found' ? resolvedTown : null
  const showError = touched && !isNumeric
  const showNotFound = validationResult === 'not_found'
  const showConnectionError = validationResult === 'error'
  const isHintValue = !touched && value === DEMO_POSTAL_CODE

  // Ilustración del pueblo (porte del encargo 11 de Lovable). La da la API
  // con el territorio; mientras no esté cargada se ve el mapa de siempre.
  const reduceMotion = useReducedMotion()
  const [loadedArtSrc, setLoadedArtSrc] = useState<string | null>(null)
  const { homeTown, nearbyTowns } = useTerritoryFor(cityName ? value : null)
  const townArtSrc = cityName ? homeTown?.artUrl : null
  const isArtReady = !!townArtSrc && loadedArtSrc === townArtSrc

  useEffect(() => {
    if (!isComplete) {
      setIsValidating(false)
      setValidationResult('idle')
      setResolvedTown(null)
      setLoadedArtSrc(null)
      return
    }
    let cancelled = false
    setIsValidating(true)
    setValidationResult('idle')
    setLoadedArtSrc(null)
    lookupTown(value)
      .then((town) => {
        if (cancelled) return
        setIsValidating(false)
        setResolvedTown(town)
        setValidationResult(town ? 'found' : 'not_found')
      })
      .catch(() => {
        if (cancelled) return
        setIsValidating(false)
        setResolvedTown(null)
        setValidationResult('error')
      })
    return () => {
      cancelled = true
    }
  }, [value, isComplete])

  const openChoices = () => {
    inputRef.current?.blur()
    setSelectedChoice(null)
    setChoiceOpen(true)
  }

  useEffect(() => {
    if (isChoiceCode) openChoices()
  }, [isChoiceCode])

  // Con sesión abierta, el código postal de la cuenta (lo guarda el acceso).
  const accountLocation = () => {
    const { session, profiles } = useAppStore.getState()
    const profile = session ? profiles[session.user.id] : null
    return profile?.postal_code
      ? { postalCode: profile.postal_code, town: profile.town ?? '' }
      : null
  }

  /**
   * «Entrar» con una población elegida (decidido el 27-11-2026).
   *
   * La maqueta guarda el código postal de la población; aquí no: la cuenta
   * de quien prueba la demostración vive en Demo KM0 (cuenta, puntos,
   * comercios y premios de mentira, aparte de cualquier pueblo real) y la
   * elección solo cambia lo que se ve del pueblo: nombre, ilustración,
   * agenda y noticias (`packages/app/utils/showcase.ts`).
   *
   * Una cuenta de un pueblo real no entra en la demostración: el servidor
   * no la deja cruzar, y aquí se dice antes de enseñarle una demo vacía.
   */
  const handleChoose = () => {
    if (!selectedChoice) return
    const account = accountLocation()
    if (account && !isDemoPostalCode(account.postalCode)) {
      toast.info(
        t('demo.notice.real_account_blocked', lang).replace(
          '{town}',
          account.town
        ),
        { duration: 12000 }
      )
      return
    }
    const home = selectedChoice.towns.find(
      (town) => town.postalCodes.length > 0
    )
    setShowcase(selectedChoice, home?.id ?? null)
    setLocation(DEMO_POSTAL_CODE, DEMO_TOWN_NAME)
    setChoiceOpen(false)
    navigate('/home')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (!touched) setTouched(true)
  }

  const handleFocus = () => {
    if (!touched && value === DEMO_POSTAL_CODE) {
      setValue('')
      setTouched(true)
    }
  }

  const enterTown = (postalCode: string, town: string) => {
    // Zustand es la máquina de setup de producción. RequireSetup lee
    // postalCode del store, no las claves sueltas de Lovable.
    setShowcase(null)
    setLocation(postalCode, town)
    navigate('/home')
  }

  const handleSubmit = async () => {
    if (!isComplete || !cityName) return
    // Con sesión abierta el pueblo es de la cuenta y lo decide el servidor.
    const account = accountLocation()
    const session = useAppStore.getState().session
    if (session && account && account.postalCode !== value) {
      // Una cuenta de demostración no pasa a un pueblo real sin preguntar.
      if (isDemoPostalCode(account.postalCode)) {
        setLeaving({ town: cityName, postalCode: value })
        return
      }
      await updateProfile(session.user.id, { postal_code: value })
    }
    enterTown(value, cityName)
  }

  const confirmLeaveDemo = async () => {
    if (!leaving) return
    setLeaveBusy(true)
    const moved = await leaveDemo(leaving.postalCode)
    setLeaveBusy(false)
    if (!moved) {
      toast.error(t('demo.leave.failed', lang))
      return
    }
    toast.info(
      t('demo.notice.left_demo', lang).replace('{town}', leaving.town),
      { duration: 12000 }
    )
    setLeaving(null)
    navigate('/home')
  }

  // En el móvil el botón puede quedar bajo el teclado: la tecla de
  // confirmar del teclado hace lo mismo que «Continuar».
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <BrandedFrame
      onBack={() => navigate(-1)}
      backAriaLabel={t('common.back', lang)}
      frameRef={setFrame}
    >
      {/* Maqueta ÚNICA portrait, centrada verticalmente en el marco. */}
      <div className="w-full max-w-[390px] mx-auto flex flex-col gap-6 vertical-mobile:gap-7 min-h-full justify-center py-4">
        {/* La ilustración del pueblo es apaisada: con ella la tarjeta se
            acorta, para no dejar un bloque amarillo vacío y para que el
            botón quepa con el teclado del móvil abierto. */}
        <motion.div
          className={cn(
            'relative w-full max-w-[320px] mx-auto shrink-0 rounded-3xl overflow-hidden shadow-lg transition-[aspect-ratio] duration-300 motion-reduce:transition-none',
            isArtReady ? 'aspect-[2/1]' : 'aspect-square'
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <img
            src={postalCodeMapAsset.url}
            alt={t('postal.image_alt', lang)}
            aria-hidden={isArtReady}
            className="h-full w-full object-cover"
          />
          <AnimatePresence>
            {townArtSrc && (
              <motion.div
                key={townArtSrc}
                aria-hidden={!isArtReady}
                className="absolute inset-0 flex items-center justify-center bg-km0-yellow-500 px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: isArtReady ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              >
                <TownArt
                  src={townArtSrc}
                  onLoad={() => setLoadedArtSrc(townArtSrc)}
                  onError={() => setLoadedArtSrc(null)}
                  className="pointer-events-none h-full w-full select-none object-contain object-center"
                />
              </motion.div>
            )}
          </AnimatePresence>
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
              {nearbyTowns.length > 0 && (
                <div className="mt-2 flex flex-col items-center gap-1.5">
                  <p className="font-body text-xs text-muted-foreground">
                    {t('territory.alsoSee', lang)}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {nearbyTowns.map((town) => (
                      <TownTag key={town.id} townName={town.name} lang={lang} />
                    ))}
                  </div>
                </div>
              )}
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
              ref={inputRef}
              onClick={() => {
                if (isChoiceCode && !choiceOpen) openChoices()
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder={t('postal.placeholder', lang)}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              enterKeyHint="go"
              className={cn(
                'flex-1 bg-transparent font-ui text-lg placeholder:text-muted-foreground/50 outline-none',
                isHintValue ? 'text-muted-foreground/50' : 'text-foreground'
              )}
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
            {showConnectionError && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 text-destructive font-ui text-sm px-1"
              >
                <AlertTriangle size={14} />
                <span>{t('postal.error_connection', lang)}</span>
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
            disabled={!cityName || isValidating || choiceOpen}
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
      <BubbleSheet
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        title={t('demo.title', lang)}
        lang={lang}
        container={frame}
        footer={
          <Button
            type="button"
            variant="bubblePrimary"
            disabled={!selectedChoice}
            onClick={handleChoose}
            className="w-full"
          >
            {t('demo.enter', lang)}
          </Button>
        }
      >
        <p className="mb-4 font-body text-sm text-km0-blue-700">
          {t('demo.help', lang)}
        </p>
        <TownChoiceList
          choices={townChoices.choices}
          loading={townChoices.loading}
          error={townChoices.error}
          selectedId={selectedChoice?.id ?? null}
          onSelect={setSelectedChoice}
          onRetry={townChoices.reload}
          onBack={() => setChoiceOpen(false)}
          lang={lang}
        />
      </BubbleSheet>
      <LeaveDemoSheet
        open={leaving !== null}
        town={leaving?.town ?? ''}
        busy={leaveBusy}
        onConfirm={confirmLeaveDemo}
        onStay={() => setLeaving(null)}
        lang={lang}
        container={frame}
      />
    </BrandedFrame>
  )
}

export default PostalCode
