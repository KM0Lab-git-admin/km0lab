import { Button } from '@km0lab/ui'
import { Users } from 'lucide-react'

/*
 * Copia de `src/components/PilotFullNotice.tsx` de Lovable (encargo 13,
 * commit 01c3db5), con los imports de producción. Tiene candado en el
 * manifest por lo mismo que `InviteCodeField`: solo la usa `Login`.
 */
export interface PilotFullNoticeProps {
  title: string
  description: string
  exploreLabel: string
  backLabel: string
  onExplore: () => void
  onBack: () => void
}

/** Friendly replacement for the sign-up form when the pilot has no places left. */
const PilotFullNotice = ({
  title,
  description,
  exploreLabel,
  backLabel,
  onExplore,
  onBack,
}: PilotFullNoticeProps) => (
  <section
    role="status"
    className="flex flex-col items-center gap-3 text-center"
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-km0-yellow-100 text-km0-blue-800">
      <Users aria-hidden size={24} />
    </span>
    <h1 className="font-brand text-2xl text-km0-blue-700">{title}</h1>
    <p className="font-body text-sm text-muted-foreground">{description}</p>
    <div className="mt-2 flex w-full flex-col gap-2">
      <Button
        type="button"
        variant="bubblePrimary"
        onClick={onExplore}
        className="w-full"
      >
        {exploreLabel}
      </Button>
      <Button
        type="button"
        variant="bubbleSecondary"
        onClick={onBack}
        className="w-full"
      >
        {backLabel}
      </Button>
    </div>
  </section>
)

export default PilotFullNotice
