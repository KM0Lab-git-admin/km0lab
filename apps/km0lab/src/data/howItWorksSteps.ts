import {
  UserPlus,
  Store,
  ScanLine,
  Sparkles,
  Gift,
  type LucideIcon,
} from 'lucide-react'

import type { TKey } from '@km0lab/app'

import step1 from '@/assets/how-it-works/step1.png.asset.json'
import step2 from '@/assets/how-it-works/step2.png.asset.json'
import step3 from '@/assets/how-it-works/step3.png.asset.json'
import step4 from '@/assets/how-it-works/step4.png.asset.json'
import step5 from '@/assets/how-it-works/step5.png.asset.json'

/**
 * howItWorksSteps — estructura del carrusel «Com funciona?»
 * (`/how-it-works`). El copy NO vive aquí: solo hay claves tipadas
 * (`TKey`) del diccionario de `lib/i18n.ts`, más el orden, el icono y el
 * panel de color de cada paso.
 *
 * `image` apunta al asset CDN de cada paso; la card conserva el icono como
 * respaldo si alguna ilustración no está disponible.
 */
export interface HowItWorksStep {
  /** Identificador estable (thumbnails y claves React). */
  id: string
  /** Número de paso (1…5) — se muestra en el badge «PAS n». */
  step: number
  titleKey: TKey
  descKey: TKey
  /** Clase Tailwind del panel de ilustración (token km0-*). */
  panelClass: string
  /** Icono lucide: thumbnail + marcador del panel provisional. */
  icon: LucideIcon
  /** Ilustración del paso (URL Vite) o `null` mientras no exista. */
  image: string | null
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: 'register',
    step: 1,
    titleKey: 'how_it_works.step1.title',
    descKey: 'how_it_works.step1.desc',
    panelClass: 'bg-km0-blue-100',
    icon: UserPlus,
    image: step1.url,
  },
  {
    id: 'visit_merchants',
    step: 2,
    titleKey: 'how_it_works.step2.title',
    descKey: 'how_it_works.step2.desc',
    panelClass: 'bg-km0-beige-100',
    icon: Store,
    image: step2.url,
  },
  {
    id: 'scan_qr',
    step: 3,
    titleKey: 'how_it_works.step3.title',
    descKey: 'how_it_works.step3.desc',
    panelClass: 'bg-km0-teal-100',
    icon: ScanLine,
    image: step3.url,
  },
  {
    id: 'keep_earning',
    step: 4,
    titleKey: 'how_it_works.step4.title',
    descKey: 'how_it_works.step4.desc',
    panelClass: 'bg-km0-yellow-100',
    icon: Sparkles,
    image: step4.url,
  },
  {
    id: 'enjoy_points',
    step: 5,
    titleKey: 'how_it_works.step5.title',
    descKey: 'how_it_works.step5.desc',
    panelClass: 'bg-km0-coral-100',
    icon: Gift,
    image: step5.url,
  },
]
