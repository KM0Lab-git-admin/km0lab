import { cn } from '@/lib/utils'

interface PointsCoinProps {
  points: number
  earned?: boolean
  className?: string
}

const PointsCoin = ({ points, earned = false, className }: PointsCoinProps) => (
  <span
    className={cn(
      'inline-flex min-h-[30px] shrink-0 items-center gap-1 rounded-full bg-km0-yellow-500 py-1 pl-1 pr-2.5 font-ui text-[13px] font-extrabold tabular-nums text-km0-blue-900',
      className
    )}
  >
    <svg aria-hidden viewBox="0 0 32 32" className="h-6 w-6 shrink-0">
      <ellipse
        cx="16"
        cy="18"
        rx="14"
        ry="12"
        className="fill-km0-yellow-700"
      />
      <path
        d="M5 20v4m4-2v4m5-3v5m5-5v5m5-7v5m4-8v4"
        className="stroke-km0-yellow-500"
        strokeWidth="1.2"
      />
      <circle
        cx="16"
        cy="15"
        r="13.5"
        className="fill-km0-yellow-500 stroke-km0-yellow-700"
        strokeWidth="1"
      />
      <circle
        cx="16"
        cy="15"
        r="10.5"
        className="fill-km0-yellow-300 stroke-km0-yellow-700"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 13a10.5 10.5 0 0 1 15-7.5"
        className="fill-none stroke-km0-yellow-100"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 23a10 10 0 0 0 15-8"
        className="fill-none stroke-km0-yellow-600"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 8.5l1.6 3.3 3.7.5-2.7 2.6.6 3.7-3.2-1.7-3.2 1.7.6-3.7-2.7-2.6 3.7-.5z"
        className="fill-km0-yellow-600 stroke-km0-yellow-700"
        strokeWidth=".6"
        strokeLinejoin="round"
      />
      <path
        d="M10 9l2-1m-4 5 .5-1"
        className="stroke-km0-yellow-100"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
    {earned ? '+' : ''}
    {points.toLocaleString('es-ES')}
  </span>
)

export default PointsCoin
