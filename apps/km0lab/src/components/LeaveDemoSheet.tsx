import { t, type Lang } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { Loader2 } from 'lucide-react'

import BubbleSheet from '@/components/BubbleSheet'

/*
 * De producción (candado en el manifest): no existe en Lovable.
 *
 * Una cuenta de demostración que entra desde un pueblo real no cambia de
 * sitio sola. Aquí se pregunta: «Seguir» la convierte en la cuenta de vecino
 * de ese pueblo (empieza de cero, con los puntos de bienvenida) y «Volver a
 * la demo» la deja como está. Cerrar la hoja es volver a la demo: lo que no
 * tiene vuelta atrás solo ocurre con el botón que lo dice.
 */
interface LeaveDemoSheetProps {
  open: boolean
  /** El pueblo real al que pasaría la cuenta. */
  town: string
  busy?: boolean
  onConfirm: () => void
  onStay: () => void
  lang: Lang
  container?: HTMLElement | null
}

const LeaveDemoSheet = ({
  open,
  town,
  busy = false,
  onConfirm,
  onStay,
  lang,
  container,
}: LeaveDemoSheetProps) => (
  <BubbleSheet
    open={open}
    onClose={() => {
      if (!busy) onStay()
    }}
    title={t('demo.leave.title', lang)}
    lang={lang}
    container={container}
    footer={
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="bubblePrimary"
          disabled={busy}
          onClick={onConfirm}
          className="w-full"
        >
          {busy ? (
            <Loader2 aria-hidden className="animate-spin" />
          ) : (
            t('demo.leave.confirm', lang)
          )}
        </Button>
        <Button
          type="button"
          variant="bubbleSurface"
          disabled={busy}
          onClick={onStay}
          className="w-full rounded-2xl bg-card text-km0-blue-800"
        >
          {t('demo.leave.stay', lang)}
        </Button>
      </div>
    }
  >
    <p className="font-body text-sm leading-relaxed text-km0-blue-700">
      {t('demo.leave.body', lang).replace('{town}', town)}
    </p>
  </BubbleSheet>
)

export default LeaveDemoSheet
