import { Button } from '@km0lab/ui'
import { Bell } from 'lucide-react'

import { cn } from '@/lib/utils'

interface NotificationBellProps {
  /** true → dot coral (hay notificaciones sin leer); false → dot gris (todo leído). */
  hasAlerts?: boolean
  onClick?: () => void
  className?: string
  ariaLabel?: string
}

const NotificationBell = ({
  hasAlerts = false,
  onClick,
  className,
  ariaLabel,
}: NotificationBellProps) => (
  <Button
    variant="bubbleSurface"
    size="icon"
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'relative h-11 w-11 shrink-0 rounded-full bg-card text-km0-blue-800 shadow-[var(--shadow-bubble)]',
      className
    )}
  >
    <Bell aria-hidden className="!h-6 !w-6" />
    <span
      aria-hidden
      data-testid="notification-indicator"
      className={cn(
        'absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-card transition-colors',
        hasAlerts ? 'bg-km0-coral-400' : 'bg-muted-foreground'
      )}
    />
  </Button>
)

export default NotificationBell
