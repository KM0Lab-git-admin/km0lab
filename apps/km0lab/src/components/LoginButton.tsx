/**
 * LoginButton — botón "Iniciar sesión" puro y reutilizable.
 *
 * No incluye wrapper, animaciones ni margins externos: el consumidor
 * decide layout y spacing. Solo expone tamaño (`sm` | `md`) y un hook
 * `className` para overrides puntuales por breakpoint.
 */
export interface LoginButtonProps {
  onClick: () => void
  size?: 'sm' | 'md'
  className?: string
  label?: string
}

const BASE =
  'font-ui font-bold text-km0-blue-700 bg-km0-yellow-500 hover:bg-km0-yellow-400 active:scale-95 transition-all rounded-full whitespace-nowrap shadow-[0_4px_12px_-4px_hsl(var(--km0-blue-700)/0.3)] min-h-9 flex items-center justify-center'

const SIZES: Record<NonNullable<LoginButtonProps['size']>, string> = {
  sm: 'text-xs px-3.5 py-1',
  md: 'text-sm px-4 py-2',
}

const LoginButton = ({
  onClick,
  size = 'sm',
  className = '',
  label = 'Iniciar sesión',
}: LoginButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BASE} ${SIZES[size]} ${className}`.trim()}
    >
      {label}
    </button>
  )
}

export default LoginButton
