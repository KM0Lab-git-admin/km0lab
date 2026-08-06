import {
  scannerMachine,
  t,
  useAppStore,
  type ScanErrorKind,
  type TKey,
} from '@km0lab/app'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { Capacitor } from '@capacitor/core'
import { useMachine } from '@xstate/react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  ImageUp,
  Loader2,
  ScanLine,
  WifiOff,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import Km0Logo from '@/components/Km0Logo'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * Scanner — Escàner global de QR.
 *
 * La lògica del flux viu a `scannerMachine` (XState), que valida contra
 * `POST /scans`. La lectura del QR és real: càmera (mòbil) o imatge pujada
 * (escriptori), via `@zxing/browser`.
 */

const ERROR_ICONS: Record<ScanErrorKind, typeof AlertTriangle> = {
  ja_visitat: Check,
  codi_no_valid: AlertTriangle,
  qr_caducat: AlertTriangle,
  sense_connexio: WifiOff,
}

const format = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

type CameraError = 'denied' | 'unavailable' | null

interface DetectedBarcode {
  rawValue: string
}
interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
}

const Scanner = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [state, send] = useMachine(scannerMachine)
  const [searchParams] = useSearchParams()

  const session = useAppStore((s) => s.session)
  const profiles = useAppStore((s) => s.profiles)
  const setUserPoints = useAppStore((s) => s.setUserPoints)
  const userFirstName = useMemo(() => {
    if (!session) return ''
    return profiles[session.user.id]?.first_name ?? ''
  }, [session, profiles])

  const status = state.value as 'reading' | 'validating' | 'error' | 'success'

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraError, setCameraError] = useState<CameraError>(null)
  const deeplinkHandled = useRef(false)

  // Diagnòstic en pantalla (activable amb `?debug=1`).
  const debug = searchParams.get('debug') === '1'
  const scanInfo = useRef({
    gum: 'pending' as 'pending' | 'ok' | 'error',
    detector: '-',
    vw: 0,
    vh: 0,
    ready: 0,
    ticks: 0,
    lastErr: '',
  })
  const [, forceDiag] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    if (!debug) return
    const id = window.setInterval(forceDiag, 300)
    return () => window.clearInterval(id)
  }, [debug])

  // ── Càmera: arranca només a `reading` ──────────────────────
  useEffect(() => {
    if (status !== 'reading') {
      return
    }
    // En plataforma nativa el escáner lo abre el plugin nativo (efecto aparte).
    if (Capacitor.isNativePlatform()) {
      return
    }
    const video = videoRef.current
    if (!video) {
      return
    }

    const info = scanInfo.current
    info.gum = 'pending'
    info.ticks = 0
    info.lastErr = ''

    if (!navigator.mediaDevices?.getUserMedia) {
      info.gum = 'error'
      setCameraError('unavailable')
      return
    }

    let cancelled = false
    let stream: MediaStream | null = null
    let scanTimer: number | undefined

    // Detector natiu (Chrome Android): molt més fiable que zxing amb la
    // càmera en viu. zxing queda com a fallback.
    const Ctor = (
      window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }
    ).BarcodeDetector
    let nativeDetector: BarcodeDetectorInstance | null = null
    if (Ctor) {
      try {
        nativeDetector = new Ctor({ formats: ['qr_code'] })
        info.detector = 'native'
      } catch {
        nativeDetector = null
      }
    }

    // Fallback zxing amb TRY_HARDER i només QR.
    const hints = new Map<DecodeHintType, unknown>()
    hints.set(DecodeHintType.TRY_HARDER, true)
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE])
    const reader = new BrowserQRCodeReader(hints)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!nativeDetector) {
      info.detector = 'zxing'
    }

    const onDetected = (code: string) => {
      if (cancelled || !code) return
      cancelled = true
      send({ type: 'DETECT', code })
    }

    const tick = async () => {
      if (cancelled) return
      const vw = video.videoWidth
      const vh = video.videoHeight
      info.vw = vw
      info.vh = vh
      info.ready = video.readyState
      if (vw > 0 && vh > 0) {
        info.ticks += 1
        try {
          if (nativeDetector) {
            const codes = await nativeDetector.detect(video)
            if (cancelled) return
            const raw = codes[0]?.rawValue
            if (raw) {
              onDetected(raw)
              return
            }
          } else if (ctx) {
            if (canvas.width !== vw) canvas.width = vw
            if (canvas.height !== vh) canvas.height = vh
            ctx.drawImage(video, 0, 0, vw, vh)
            const code = reader.decodeFromCanvas(canvas).getText()
            if (code) {
              onDetected(code)
              return
            }
          }
        } catch (e) {
          const name = (e as { name?: string } | null)?.name
          if (name && name !== 'NotFoundException') {
            info.lastErr = name
          }
        }
      }
      if (!cancelled) {
        scanTimer = window.setTimeout(() => void tick(), 100)
      }
    }

    const start = (s: MediaStream) => {
      if (cancelled) {
        s.getTracks().forEach((t) => t.stop())
        return
      }
      stream = s
      info.gum = 'ok'
      video.srcObject = s
      void video.play().catch(() => {})
      if (video.readyState >= 2 && video.videoWidth > 0) {
        void tick()
      } else {
        const onReady = () => {
          video.removeEventListener('loadeddata', onReady)
          if (!cancelled) void tick()
        }
        video.addEventListener('loadeddata', onReady)
      }
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .catch((e: unknown) => {
        if (cancelled) return null
        const name = (e as { name?: string } | null)?.name
        if (name === 'NotAllowedError') {
          info.gum = 'error'
          setCameraError('denied')
          return null
        }
        return navigator.mediaDevices.getUserMedia({ video: true })
      })
      .then((s) => {
        if (cancelled || !s) return
        start(s)
      })
      .catch(() => {
        if (!cancelled) {
          info.gum = 'error'
          setCameraError('unavailable')
        }
      })

    return () => {
      cancelled = true
      if (scanTimer) window.clearTimeout(scanTimer)
      stream?.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }
  }, [status, send])

  // ── Escáner nativo (Capacitor): abre la UI de cámara nativa ──
  useEffect(() => {
    if (status !== 'reading') return
    if (!Capacitor.isNativePlatform()) return
    let cancelled = false
    void (async () => {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        })
        if (cancelled) return
        const code = result.ScanResult
        send({ type: 'DETECT', code: code || '' })
      } catch {
        // Usuario canceló o permiso denegado: vuelve al listado de comercios.
        if (!cancelled) navigate('/merchants')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [status, send, navigate])

  // ── Deep link `/scanner?c=<token>` ─────────────────────────
  useEffect(() => {
    if (deeplinkHandled.current) return
    const c = searchParams.get('c')
    if (c) {
      deeplinkHandled.current = true
      send({ type: 'DETECT', code: c })
    }
  }, [searchParams, send])

  // ── ÈXIT → actualitza saldo i navega a Confirmació ─────────
  useEffect(() => {
    if (status !== 'success' || !state.context.result?.ok) return
    const r = state.context.result
    setUserPoints(r.totalPunts)
    const timer = window.setTimeout(() => {
      navigate('/scanner/success', {
        state: {
          comercId: r.comercId,
          comercNom: r.comercNom,
          puntsGuanyats: r.puntsGuanyats,
          totalPunts: r.totalPunts,
          nivell: r.nivell,
        },
      })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [status, state.context.result, navigate, setUserPoints])

  const close = () => navigate('/merchants')
  const retry = () => {
    setCameraError(null)
    send({ type: 'RESET' })
  }

  const onPickImage = async (file: File | null | undefined) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    try {
      const reader = new BrowserQRCodeReader()
      const result = await reader.decodeFromImageUrl(url)
      const code = result.getText()
      send({ type: 'DETECT', code: code || '' })
    } catch {
      send({ type: 'DETECT', code: '' })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return (
    <BrandedFrame
      hideHeader
      portraitContentClassName="relative p-0 overflow-hidden"
      landscapeContentClassName="relative p-0 overflow-hidden"
    >
      {/* Header ── cierre + logo ─────────────────────────── */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-4 pt-5 pb-3">
        <button
          type="button"
          onClick={close}
          aria-label={t('scanner.close', lang)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-km0-blue-900/5 text-km0-blue-900 hover:bg-km0-blue-900/10 transition-colors"
        >
          <X size={20} strokeWidth={2.4} />
        </button>
        <Km0Logo className="h-7 w-auto" />
        <div className="w-10" aria-hidden="true" />
      </header>

      {/* Títol ── marca + hint ─────────────────────────── */}
      <div className="shrink-0 px-6 pb-4">
        <h1 className="font-brand text-2xl text-km0-blue-900">
          {t('scanner.title', lang)}
        </h1>
        <p className="mt-1 font-body text-sm text-km0-blue-900/70">
          {t('scanner.hint', lang)}
        </p>
      </div>

      {/* Visor ── càmera real + esquines teal ─────────── */}
      <div className="relative flex-1 min-h-0 mx-6 mb-4 rounded-3xl overflow-hidden bg-km0-blue-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            cameraError ? 'hidden' : 'opacity-100'
          )}
        />

        {debug && (
          <div className="absolute left-2 top-2 z-40 rounded-lg bg-km0-blue-900/85 px-3 py-2 font-ui text-xs leading-snug text-km0-beige-50">
            <div>cam: {scanInfo.current.gum}</div>
            <div>det: {scanInfo.current.detector}</div>
            <div>
              res: {scanInfo.current.vw}×{scanInfo.current.vh}
            </div>
            <div>rs: {scanInfo.current.ready}</div>
            <div>scan: {scanInfo.current.ticks}</div>
            <div>err: {scanInfo.current.lastErr || '-'}</div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative aspect-square w-full max-w-[260px]">
            {/* Esquines */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
            ].map((pos) => (
              <span
                key={pos}
                className={cn('absolute w-10 h-10 border-km0-teal-400', pos)}
              />
            ))}

            {/* Línia d'escaneig animada (només durant lectura) */}
            {status === 'reading' && !cameraError && (
              <motion.div
                aria-hidden
                className="absolute left-3 right-3 h-[2px] rounded-full bg-km0-teal-400 shadow-[0_0_12px_hsl(var(--km0-teal-400))]"
                initial={{ top: '12%' }}
                animate={{ top: ['12%', '88%', '12%'] }}
                transition={{
                  duration: 2.4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            )}
          </div>
        </div>

        {/* Overlay error de càmera */}
        {cameraError && status === 'reading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-km0-blue-900/80 backdrop-blur-sm px-6 text-center">
            <ImageUp size={36} className="text-km0-teal-400" />
            <p className="text-sm font-ui text-km0-beige-50">
              {t(
                cameraError === 'denied'
                  ? 'scanner.camera.permission_denied'
                  : 'scanner.camera.unavailable',
                lang
              )}
            </p>
            <ImageUploadButton onPick={onPickImage} />
          </div>
        )}

        {/* Overlay VALIDANT */}
        {status === 'validating' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-km0-blue-900/60 backdrop-blur-sm">
            <Loader2 size={40} className="animate-spin text-km0-teal-400" />
            <p className="text-sm font-ui font-semibold text-km0-beige-50">
              {t('scanner.validating.title', lang)}
            </p>
          </div>
        )}
      </div>

      {/* Footer ── estatus + pujar imatge ─────────────────── */}
      <footer className="shrink-0 px-6 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-km0-blue-900 px-4 py-2 text-km0-beige-50 text-xs font-ui">
          <ScanLine size={14} strokeWidth={2.2} />
          {t('scanner.footer', lang)}
        </div>

        {status === 'reading' && !cameraError && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <ImageUploadButton onPick={onPickImage} />
            <p className="text-xs font-ui text-km0-blue-900/60">
              {t('scanner.upload.hint', lang)}
            </p>
          </div>
        )}
      </footer>

      {/* Accent inferior de marca */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-km0-teal-500" />

      {/* ── ERROR overlay ─────────────────────────────── */}
      {status === 'error' && state.context.errorKind && (
        <ErrorOverlay
          kind={state.context.errorKind}
          comercNom={state.context.errorComercNom ?? undefined}
          availableAt={state.context.errorAvailableAt ?? undefined}
          onRetry={retry}
          onPromos={() =>
            navigate('/merchants', { state: { openPromos: true } })
          }
        />
      )}

      {/* ── SUCCESS mini-confirmació ─────────────────── */}
      {status === 'success' && state.context.result?.ok && (
        <SuccessOverlay
          userName={userFirstName}
          comercNom={state.context.result.comercNom}
          puntsGuanyats={state.context.result.puntsGuanyats}
          totalPunts={state.context.result.totalPunts}
        />
      )}
    </BrandedFrame>
  )
}

// ══ Sub-componentes ═════════════════════════════════════════

const ImageUploadButton = ({
  onPick,
}: {
  onPick: (file: File | null | undefined) => void
}) => {
  const { lang } = useLang()
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-km0-yellow-400 text-km0-blue-900 font-ui font-bold text-sm px-4 py-2.5 hover:bg-km0-yellow-300 active:scale-[0.99] transition-transform"
      >
        <ImageUp size={16} strokeWidth={2.4} />
        {t('scanner.upload.cta', lang)}
      </button>
    </>
  )
}

interface ErrorOverlayProps {
  kind: ScanErrorKind
  comercNom?: string
  availableAt?: string
  onRetry: () => void
  onPromos: () => void
}

const ErrorOverlay = ({
  kind,
  comercNom,
  availableAt,
  onRetry,
  onPromos,
}: ErrorOverlayProps) => {
  const { lang } = useLang()
  const Icon = ERROR_ICONS[kind]
  const isJaVisitat = kind === 'ja_visitat'

  const titleKey = `scanner.error.${kind}.title` as TKey
  const subtitleKey = `scanner.error.${kind}.subtitle` as TKey
  const subtitle = isJaVisitat
    ? format(t(subtitleKey, lang), {
        nom: comercNom ?? '',
        data: availableAt ?? '—',
      })
    : t(subtitleKey, lang)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-40 flex items-end justify-center bg-km0-blue-900/70 backdrop-blur-sm"
    >
      <div className="w-full rounded-t-3xl bg-km0-beige-50 text-km0-blue-900 p-6 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-km0-yellow-100 flex items-center justify-center">
          <Icon size={28} strokeWidth={2.4} className="text-km0-blue-900" />
        </div>
        <h2 className="font-ui font-bold text-lg text-center">
          {t(titleKey, lang)}
        </h2>
        <p className="mt-2 text-sm font-ui text-km0-blue-900/75 text-center">
          {subtitle}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {isJaVisitat && (
            <button
              type="button"
              onClick={onPromos}
              className="w-full rounded-xl bg-km0-blue-900 text-km0-beige-50 font-ui font-bold text-sm py-3 hover:bg-km0-blue-800 transition-colors"
            >
              {t('scanner.error.ja_visitat.cta_promos', lang)}
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'w-full rounded-xl font-ui font-bold text-sm py-3 transition-colors',
              isJaVisitat
                ? 'bg-transparent text-km0-blue-900 border-2 border-km0-blue-900/20 hover:bg-km0-blue-900/5'
                : 'bg-km0-yellow-400 text-km0-blue-900 hover:bg-km0-yellow-300'
            )}
          >
            {isJaVisitat
              ? t('scanner.error.ja_visitat.cta_next', lang)
              : t('scanner.error.retry', lang)}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface SuccessOverlayProps {
  userName: string
  comercNom: string
  puntsGuanyats: number
  totalPunts: number
}

const SuccessOverlay = ({
  userName,
  comercNom,
  puntsGuanyats,
  totalPunts,
}: SuccessOverlayProps) => {
  const { lang } = useLang()
  const displayName = userName || '🎉'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-km0-blue-900/85 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="w-full rounded-3xl bg-card text-km0-blue-900 p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-km0-yellow-400 flex items-center justify-center">
          <Check size={32} strokeWidth={3} className="text-km0-blue-900" />
        </div>
        <p className="font-ui font-bold text-lg">
          {format(t('scanner.success.title', lang), { nom: displayName })}
        </p>
        <p className="mt-1 text-sm font-ui text-km0-blue-900/75">
          {format(t('scanner.success.subtitle', lang), { comerc: comercNom })}
        </p>
        <p className="mt-4 inline-block rounded-full bg-km0-yellow-100 text-km0-blue-900 font-ui font-bold text-base px-4 py-1">
          {format(t('scanner.success.points', lang), { n: puntsGuanyats })}
        </p>
        <p className="mt-3 text-xs font-ui text-km0-blue-900/60">
          {format(t('scanner.success.total', lang), { n: totalPunts })}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Scanner
