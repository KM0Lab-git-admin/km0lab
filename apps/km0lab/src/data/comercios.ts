import type { Comercio } from '@km0lab/app'
import shopBakery from '@/assets/shop-logos/shop-bakery.png'
import shopFlorist from '@/assets/shop-logos/shop-florist.png'
import shopHardware from '@/assets/shop-logos/shop-hardware.png'
import shopWine from '@/assets/shop-logos/shop-wine.png'
import shopFashion from '@/assets/shop-logos/shop-fashion.png'
import shopCafe from '@/assets/shop-logos/shop-cafe.png'
import shopPharmacy from '@/assets/shop-logos/shop-pharmacy.png'

/** Comerciantes demo de la sección "Esto es para ti". */
export const COMERCIOS: Comercio[] = [
  { id: 'sanait', name: 'Sanait', logo: shopBakery, bg: 'bg-km0-teal-50' },
  { id: 'vidal', name: 'Vidal', logo: shopFlorist, bg: 'bg-km0-beige-100' },
  { id: 'manit', name: 'Manitas', logo: shopHardware, bg: 'bg-km0-yellow-100' },
  { id: 'champ', name: 'Champa', logo: shopWine, bg: 'bg-km0-blue-50' },
  { id: 'anna', name: 'Anna', logo: shopFashion, bg: 'bg-km0-coral-100' },
  { id: 'cafemar', name: 'Cafè Mar', logo: shopCafe, bg: 'bg-km0-beige-100' },
  { id: 'farma', name: 'Farma+', logo: shopPharmacy, bg: 'bg-km0-teal-50' },
]
