import { Button } from '@km0lab/ui'

import { cn } from '@/lib/utils'

interface FilterChipProps {
  active: boolean
  onClick: () => void
  label: string
}
const FilterChip = ({ active, onClick, label }: FilterChipProps) => (
  <Button
    type="button"
    variant="bubbleSurface"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'h-auto min-h-10 whitespace-normal rounded-full px-3 py-2 font-ui text-xs font-bold text-km0-blue-800',
      active ? 'bg-km0-yellow-400' : 'bg-card'
    )}
  >
    {label}
  </Button>
)
export default FilterChip
