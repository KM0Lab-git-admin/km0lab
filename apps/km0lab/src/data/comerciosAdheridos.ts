import type { CategoriaAdherit, ComercAdherit, ComercDetall } from '@km0lab/app'
import shopBakery from '@/assets/shop-logos/shop-bakery.png'
import shopCafe from '@/assets/shop-logos/shop-cafe.png'
import shopFashion from '@/assets/shop-logos/shop-fashion.png'
import shopFlorist from '@/assets/shop-logos/shop-florist.png'
import shopHardware from '@/assets/shop-logos/shop-hardware.png'
import shopPharmacy from '@/assets/shop-logos/shop-pharmacy.png'
import shopWine from '@/assets/shop-logos/shop-wine.png'

/**
 * Mock de comerços adherits al programa de punts KM0.
 * No hi ha API real; les distàncies i punts són valors inventats.
 */
export const COMERCIOS_ADHERITS: ComercAdherit[] = [
  {
    id: 'forn-rovira',
    nom: 'Forn Rovira',
    categoriaSlug: 'alimentacio',
    categoriaNom: { ca: 'Alimentació', es: 'Alimentación' },
    adreca: 'C. de Mar, 14',
    distanciaM: 240,
    punts: 20,
    teQR: true,
    emoji: '🥐',
    imatge: shopBakery,
    bg: 'bg-km0-yellow-100',
  },
  {
    id: 'cafe-del-mar',
    nom: 'Cafè del Mar',
    categoriaSlug: 'restauracio',
    categoriaNom: { ca: 'Restauració', es: 'Restauración' },
    adreca: 'Pg. Marítim, 3',
    distanciaM: 310,
    punts: 15,
    teQR: true,
    emoji: '☕',
    imatge: shopCafe,
    bg: 'bg-km0-teal-100',
  },
  {
    id: 'cal-sastre',
    nom: 'Cal Sastre',
    categoriaSlug: 'moda',
    categoriaNom: { ca: 'Moda', es: 'Moda' },
    adreca: 'C. Girona, 22',
    distanciaM: 480,
    punts: 25,
    teQR: true,
    emoji: '👕',
    imatge: shopFashion,
    bg: 'bg-km0-coral-100',
  },
  {
    id: 'floristeria-nom',
    nom: 'Floristeria Nom',
    categoriaSlug: 'serveis',
    categoriaNom: { ca: 'Serveis', es: 'Servicios' },
    adreca: 'Pl. Catalunya, 1',
    distanciaM: 520,
    punts: 20,
    teQR: false,
    emoji: '💐',
    imatge: shopFlorist,
    bg: 'bg-km0-beige-100',
  },
  {
    id: 'vins-champa',
    nom: 'Vins Champa',
    categoriaSlug: 'alimentacio',
    categoriaNom: { ca: 'Alimentació', es: 'Alimentación' },
    adreca: 'C. Bruc, 8',
    distanciaM: 610,
    punts: 30,
    teQR: true,
    emoji: '🍷',
    imatge: shopWine,
    bg: 'bg-km0-blue-50',
  },
  {
    id: 'farmacia-plus',
    nom: 'Farmàcia+',
    categoriaSlug: 'salut',
    categoriaNom: { ca: 'Salut i bellesa', es: 'Salud y belleza' },
    adreca: 'Av. Costa Brava, 45',
    distanciaM: 680,
    punts: 10,
    teQR: true,
    emoji: '💊',
    imatge: shopPharmacy,
    bg: 'bg-km0-teal-50',
  },
  {
    id: 'manitas',
    nom: 'Manitas',
    categoriaSlug: 'llar',
    categoriaNom: { ca: 'Llar i decoració', es: 'Hogar y decoración' },
    adreca: 'C. Indústria, 12',
    distanciaM: 730,
    punts: 15,
    teQR: false,
    emoji: '🔧',
    imatge: shopHardware,
    bg: 'bg-km0-yellow-50',
  },
  {
    id: 'llibreria-vidal',
    nom: 'Llibreria Vidal',
    categoriaSlug: 'cultura',
    categoriaNom: { ca: 'Cultura i lleure', es: 'Cultura y ocio' },
    adreca: 'Rbla. dels Pins, 5',
    distanciaM: 820,
    punts: 20,
    teQR: true,
    emoji: '📚',
    bg: 'bg-km0-blue-100',
  },
]

/**
 * Mock de categories amb comptador. Total (32) coincideix amb la suma
 * teòrica del programa (encara que aquí només tinguem 8 comerços mock).
 */
export const CATEGORIES_ADHERITS: CategoriaAdherit[] = [
  {
    slug: 'totes',
    nom: { ca: 'Totes les categories', es: 'Todas las categorías' },
    count: 32,
    emoji: '🗂️',
  },
  {
    slug: 'alimentacio',
    nom: { ca: 'Alimentació', es: 'Alimentación' },
    count: 8,
    emoji: '🥐',
  },
  {
    slug: 'restauracio',
    nom: { ca: 'Restauració', es: 'Restauración' },
    count: 6,
    emoji: '☕',
  },
  {
    slug: 'serveis',
    nom: { ca: 'Serveis', es: 'Servicios' },
    count: 5,
    emoji: '🔧',
  },
  { slug: 'moda', nom: { ca: 'Moda', es: 'Moda' }, count: 4, emoji: '👕' },
  {
    slug: 'salut',
    nom: { ca: 'Salut i bellesa', es: 'Salud y belleza' },
    count: 3,
    emoji: '💆',
  },
  {
    slug: 'llar',
    nom: { ca: 'Llar i decoració', es: 'Hogar y decoración' },
    count: 2,
    emoji: '🛋️',
  },
  {
    slug: 'cultura',
    nom: { ca: 'Cultura i lleure', es: 'Cultura y ocio' },
    count: 2,
    emoji: '🎭',
  },
  {
    slug: 'esports',
    nom: { ca: 'Esports', es: 'Deportes' },
    count: 1,
    emoji: '⚽',
  },
  {
    slug: 'tecnologia',
    nom: { ca: 'Tecnologia', es: 'Tecnología' },
    count: 1,
    emoji: '💻',
  },
]

/* ─────────────────────────────────────────────────────────────
 * Detall de comerços — MOCK. Claus per id de `COMERCIOS_ADHERITS`.
 * Dos exemples cobreixen els dos estats (visitat true/false).
 * ───────────────────────────────────────────────────────────── */
export const COMERCIOS_DETALL: Record<string, ComercDetall> = {
  'forn-rovira': {
    id: 'forn-rovira',
    nom: 'Forn Rovira',
    categoria: { ca: 'Alimentació', es: 'Alimentación' },
    subcategoria: { ca: 'Fleca', es: 'Panadería' },
    imatge: shopBakery,
    emoji: '🥐',
    bg: 'bg-km0-yellow-100',
    obertAra: true,
    horariAvui: '07:00–20:00',
    tancaA: '20:00',
    openingHours: {
      monday: { closed: true },
      tuesday: { closed: false, opens: '07:00', closes: '14:00' },
      wednesday: { closed: false, opens: '07:00', closes: '20:00' },
      thursday: { closed: false, opens: '07:00', closes: '20:00' },
      friday: { closed: false, opens: '07:00', closes: '20:00' },
      saturday: { closed: false, opens: '07:00', closes: '14:00' },
      sunday: { closed: false, opens: '07:00', closes: '14:00' },
    },
    adreca: 'Carrer de Mar, 14',
    codiPostal: '08380',
    poblacio: 'Malgrat de Mar',
    distanciaM: 240,
    telefon: '93 765 00 00',
    web: 'fornrovira.cat',
    coordenades: { lat: 41.6461, lng: 2.7419 },
    descripcio: {
      ca: 'Fleca artesanal de tota la vida. Pa fet cada matí amb massa mare, coques de temporada i brioixeria feta a mà. Cafè per emportar de 07 a 12 h.',
      es: 'Panadería artesanal de toda la vida. Pan hecho cada mañana con masa madre, cocas de temporada y bollería hecha a mano. Café para llevar de 07 a 12 h.',
    },
    punts: 20,
    visitat: false,
    promocions: [
      {
        id: 'p1',
        etiqueta: '-5%',
        titol: { ca: '5% de descompte', es: '5% de descuento' },
        detall: { ca: 'En pa i brioixeria', es: 'En pan y bollería' },
        condicio: { ca: 'Per compres de +20€', es: 'En compras de +20€' },
      },
      {
        id: 'p2',
        etiqueta: '2×1',
        titol: { ca: '2×1 en cafès de tarda', es: '2×1 en cafés de tarde' },
        detall: { ca: 'De 16 a 19 h', es: 'De 16 a 19 h' },
      },
      {
        id: 'p3',
        etiqueta: '-15%',
        titol: {
          ca: '15% en coques de temporada',
          es: '15% en cocas de temporada',
        },
        detall: { ca: 'Juny i juliol', es: 'Junio y julio' },
      },
    ],
  },
  'cafe-del-mar': {
    id: 'cafe-del-mar',
    nom: 'Cafè del Mar',
    categoria: { ca: 'Restauració', es: 'Restauración' },
    subcategoria: { ca: 'Cafeteria', es: 'Cafetería' },
    imatge: shopCafe,
    emoji: '☕',
    bg: 'bg-km0-teal-100',
    obertAra: true,
    horariAvui: '08:00–22:00',
    tancaA: '22:00',
    adreca: 'Passeig Marítim, 3',
    codiPostal: '08380',
    poblacio: 'Malgrat de Mar',
    distanciaM: 310,
    telefon: '93 765 12 34',
    web: 'cafedelmar.cat',
    coordenades: { lat: 41.6449, lng: 2.7451 },
    descripcio: {
      ca: 'Cafeteria davant del mar amb esmorzars, dinars lleugers i coctelleria al capvespre. Terrassa i vistes a la platja.',
      es: 'Cafetería frente al mar con desayunos, comidas ligeras y coctelería al atardecer. Terraza y vistas a la playa.',
    },
    punts: 15,
    visitat: true,
    promocions: [
      {
        id: 'p1',
        etiqueta: 'Regal',
        titol: { ca: 'Croissant de regal', es: 'Croissant de regalo' },
        detall: { ca: 'Amb qualsevol cafè', es: 'Con cualquier café' },
        condicio: { ca: 'Fins a les 11 h', es: 'Hasta las 11 h' },
      },
      {
        id: 'p2',
        etiqueta: '-10%',
        titol: { ca: '10% en dinars', es: '10% en comidas' },
        detall: { ca: 'De dilluns a divendres', es: 'De lunes a viernes' },
      },
    ],
  },
}
