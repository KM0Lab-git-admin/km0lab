export interface AppNotification {
  id: string
  title: string
  description: string
  /** Ruta interna a la que navegar al pulsar el link (React Router). */
  link: string
  /** Texto visible del CTA. */
  linkLabel: string
  /** Marca de tiempo legible (mock). */
  time: string
  read: boolean
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Nueva agenda cultural',
    description:
      'Ya está disponible el calendario de actos del mes en Malgrat de Mar. Descubre conciertos, ferias y mucho más.',
    link: '/home',
    linkLabel: 'Ver agenda',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: 'n2',
    title: 'Mensaje del Ayuntamiento',
    description:
      'El Ayuntamiento ha publicado un nuevo aviso sobre obras en el paseo marítimo. Consulta los detalles.',
    link: '/home',
    linkLabel: 'Leer aviso',
    time: 'Hace 2 h',
    read: false,
  },
  {
    id: 'n3',
    title: 'Promoción en Comercios KM0',
    description:
      'Tu tienda favorita tiene una nueva oferta esta semana. No te la pierdas.',
    link: '/home',
    linkLabel: 'Ver oferta',
    time: 'Ayer',
    read: true,
  },
]
