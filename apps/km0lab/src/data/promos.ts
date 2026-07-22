import type { Promo } from '@km0lab/app'

/** Eventos destacados demo para el hero del Home. */
export const PROMOS: Promo[] = [
  {
    id: 'festa-major',
    title: 'Festa Major\nRomana 2026',
    dateRange: 'Del 15 al 19 de juliol',
    location: 'Plaça de la Vila',
    badge: {
      text: 'Festa',
      emoji: '🎉',
      bg: 'bg-km0-coral-400',
      text_color: 'text-white',
    },
    gradient: 'from-km0-blue-800 via-km0-blue-700 to-km0-blue-900',
    images: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=70',
    ],
  },
  {
    id: 'mercat-nit',
    title: "Mercat de Nit\nd'Estiu",
    dateRange: 'Cada divendres de juliol',
    location: 'Passeig Marítim',
    badge: {
      text: 'Mercat',
      emoji: '🛍️',
      bg: 'bg-km0-yellow-500',
      text_color: 'text-km0-blue-900',
    },
    gradient: 'from-km0-teal-700 via-km0-teal-600 to-km0-blue-800',
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1555992336-fb0d29498b13?auto=format&fit=crop&w=1200&q=70',
    ],
  },
  {
    id: 'concert',
    title: 'Concert de Jazz\na la Plaça',
    dateRange: '12 de setembre · 20:00',
    location: 'Plaça Catalunya',
    badge: {
      text: 'Música',
      emoji: '🎷',
      bg: 'bg-km0-blue-700',
      text_color: 'text-white',
    },
    gradient: 'from-km0-yellow-400 via-km0-coral-400 to-km0-coral-500',
    images: [
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1200&q=70',
    ],
  },
  {
    id: 'fira',
    title: 'Fira Gastro\nKM0',
    dateRange: "Del 10 al 12 d'octubre",
    location: 'Centre Històric',
    badge: {
      text: 'Gastro',
      emoji: '🍴',
      bg: 'bg-km0-teal-600',
      text_color: 'text-white',
    },
    gradient: 'from-km0-coral-500 via-km0-coral-400 to-km0-blue-700',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70',
    ],
  },
]
