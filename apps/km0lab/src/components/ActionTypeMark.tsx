import {
  Cake,
  CalendarCheck,
  ClipboardList,
  Globe,
  Mail,
  QrCode,
  Star,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

import type { PointActionIcon } from '@km0lab/app'

import { cn } from '@/lib/utils'

const ICONS: Record<PointActionIcon, LucideIcon> = {
  cake: Cake,
  'user-plus': UserPlus,
  star: Star,
  qr: QrCode,
  globe: Globe,
  mail: Mail,
  'calendar-check': CalendarCheck,
  'clipboard-list': ClipboardList,
}

const GRADIENT: Record<PointActionIcon, string> = {
  cake: 'from-km0-coral-200 to-km0-coral-400',
  'user-plus': 'from-km0-teal-200 to-km0-teal-400',
  star: 'from-km0-yellow-200 to-km0-yellow-400',
  qr: 'from-km0-blue-200 to-km0-blue-400',
  globe: 'from-km0-blue-200 to-km0-blue-400',
  mail: 'from-km0-yellow-200 to-km0-yellow-400',
  'calendar-check': 'from-km0-teal-200 to-km0-teal-400',
  'clipboard-list': 'from-km0-yellow-200 to-km0-yellow-400',
}

export interface ActionTypeMarkProps {
  icon: PointActionIcon
  className?: string
}

/**
 * Marca visual de una acción de puntos: tile con degradado de tokens KM0
 * e icono Lucide grande en azul, mismo lenguaje que los premios.
 */
const ActionTypeMark = ({ icon, className }: ActionTypeMarkProps) => {
  const Icon = ICONS[icon]
  return (
    <span
      className={cn(
        'shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center',
        'bg-gradient-to-br',
        GRADIENT[icon],
        className
      )}
    >
      <Icon size={28} strokeWidth={1.8} className="text-km0-blue-900" />
    </span>
  )
}

export default ActionTypeMark
