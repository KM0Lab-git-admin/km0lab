/**
 * Catálogo de metadata de componentes propios del proyecto (no shadcn/ui).
 * Fuente de verdad para la página `/components`. Mantener sincronizado con
 * las props reales de cada componente en `src/components/*`.
 */

export type ComponentCategory =
  | 'marca'
  | 'navegacion'
  | 'cabecera'
  | 'home'
  | 'agenda'
  | 'chat'
  | 'auth'
  | 'overlay'
  | 'idioma'

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  marca: 'Marca y layout',
  navegacion: 'Navegación',
  cabecera: 'Cabeceras',
  home: 'Home',
  agenda: 'Agenda y evento',
  chat: 'Chat',
  auth: 'Auth',
  overlay: 'Overlays',
  idioma: 'Idioma',
}

export interface PropSpec {
  name: string
  type: string
  required?: boolean
  defaultValue?: string
  description: string
}

export type Breakpoint =
  | 'vertical-mobile'
  | 'vertical-tablet'
  | 'horizontal-mobile'
  | 'horizontal-desktop'

export interface ResponsiveNote {
  breakpoint: Breakpoint
  behavior: string
}

export interface ComponentSpec {
  id: string
  name: string
  category: ComponentCategory
  importPath: string
  description: string
  usedIn: string[]
  props: PropSpec[]
  responsive: ResponsiveNote[]
  notes?: string[]
}

export const componentsCatalog: ComponentSpec[] = [
  /* ─── Marca y layout ──────────────────────────────── */
  {
    id: 'branded-frame',
    name: 'BrandedFrame',
    category: 'marca',
    importPath: '@/components/BrandedFrame',
    description:
      'Wrapper obligatorio para pantallas con marca. Garantiza logo + back en posición idéntica y card de tamaño fijo (ratio móvil en portrait, 16:9 en landscape) en los 4 breakpoints.',
    usedIn: ['Language (Index)', 'Onboarding', 'PostalCode'],
    props: [
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description: 'Contenido renderizado dentro de la card.',
      },
      {
        name: 'onBack',
        type: '() => void',
        description:
          'Si se pasa, muestra el botón back amarillo a la izquierda del logo.',
      },
      {
        name: 'backAriaLabel',
        type: 'string',
        defaultValue: '"Back"',
        description:
          'Aria label del botón back (i18n responsabilidad del consumidor).',
      },
      {
        name: 'hideHeader',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Oculta el header con logo (cuando la pantalla ya tiene su propio hero).',
      },
      {
        name: 'portraitContentClassName',
        type: 'string',
        description: 'Clases extra para el body en portrait.',
      },
      {
        name: 'landscapeContentClassName',
        type: 'string',
        description: 'Clases extra para el body en landscape.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Card ratio 9:19.5, logo h-9, header pt-5/pb-4.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Misma card pero clampada a 420px de ancho.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Card ratio 16:9 compacta, logo h-8, paddings reducidos.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Card ratio 16:9 hasta 1200px, logo h-11, padding cómodo.',
      },
    ],
    notes: [
      'El tamaño de la card se calcula SOLO desde el viewport, nunca del contenido — el frame nunca se deforma.',
      'Si el contenido no cabe, hace scroll-y INTERNO en el body. Nunca scroll horizontal.',
      'Chat NO usa este wrapper: tiene layout fullbleed propio.',
    ],
  },
  {
    id: 'km0-logo',
    name: 'Km0Logo',
    category: 'marca',
    importPath: '@/components/Km0Logo',
    description:
      'Logo institucional KM0 LAB en SVG. Color y proporciones fijas, solo se controla el tamaño desde className.',
    usedIn: ['BrandedFrame', 'Chat header'],
    props: [
      {
        name: 'className',
        type: 'string',
        defaultValue: '""',
        description:
          'Clases de Tailwind para tamaño. Habitualmente "h-8" a "h-11".',
      },
    ],
    responsive: [
      { breakpoint: 'vertical-mobile', behavior: 'h-9 dentro del frame.' },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'h-9 dentro del frame (clampado por viewBox).',
      },
      { breakpoint: 'horizontal-mobile', behavior: 'h-8 compacto.' },
      { breakpoint: 'horizontal-desktop', behavior: 'h-11.' },
    ],
    notes: [
      'No añadir font-bold ni alterar fill — colores ya forman parte del SVG.',
    ],
  },
  {
    id: 'floating-dots',
    name: 'FloatingDots',
    category: 'marca',
    importPath: '@/components/FloatingDots',
    description:
      'Puntos teal animados (animate-float) posicionados absolutos sobre un contenedor `relative`. Decoración ambiental.',
    usedIn: ['PostalCode', 'Onboarding fondos'],
    props: [
      {
        name: 'className',
        type: 'string',
        description: 'Clases extra para el contenedor absoluto.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Posiciones idénticas (porcentaje del contenedor).',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Igual — escala con el padre.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Igual — escala con el padre.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Igual — escala con el padre.',
      },
    ],
    notes: ['El padre DEBE ser `relative` y normalmente `overflow-hidden`.'],
  },

  /* ─── Navegación ──────────────────────────────────── */
  {
    id: 'bottom-tabs',
    name: 'BottomTabs',
    category: 'navegacion',
    importPath: '@/components/BottomTabs',
    description:
      'Barra de navegación inferior fija con 4 tabs (Inicio · Información · Ofertas · Perfil). El tab Perfil cambia de acción según haya sesión.',
    usedIn: ['Home', 'Agenda'],
    props: [
      {
        name: 'activeTab',
        type: '"home" | "info" | "ofertes" | "perfil"',
        required: true,
        description: 'Tab activo (controlado por la pantalla).',
      },
      {
        name: 'onTabChange',
        type: '(t: HomeTab) => void',
        required: true,
        description: 'Callback al cambiar de tab.',
      },
      {
        name: 'showProfile',
        type: 'boolean',
        required: true,
        description:
          'Si hay sesión, el tab Perfil navega a /profile; si no, a /login.',
      },
      {
        name: 'onLogin',
        type: '() => void',
        required: true,
        description: 'Acción cuando no hay sesión y se pulsa Perfil.',
      },
      {
        name: 'onProfile',
        type: '() => void',
        required: true,
        description: 'Acción cuando hay sesión y se pulsa Perfil.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'pt-2/pb-3, iconos 20px, labels 10px.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Igual que vertical-mobile (no escala).',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Paddings reducidos: pt-1/pb-1.5 (override !important).',
      },
      { breakpoint: 'horizontal-desktop', behavior: 'Como vertical-mobile.' },
    ],
  },
  {
    id: 'nav-link',
    name: 'NavLink',
    category: 'navegacion',
    importPath: '@/components/NavLink',
    description:
      'Wrapper de `react-router-dom NavLink` que acepta className + activeClassName + pendingClassName como strings simples, sin function-as-children.',
    usedIn: ['(libre — disponible para cualquier nav)'],
    props: [
      {
        name: 'to',
        type: 'string',
        required: true,
        description: 'Destino (igual que NavLink de react-router).',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clases base aplicadas siempre.',
      },
      {
        name: 'activeClassName',
        type: 'string',
        description: 'Clases añadidas cuando la ruta está activa.',
      },
      {
        name: 'pendingClassName',
        type: 'string',
        description: 'Clases añadidas cuando la ruta está en pending.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Las clases que pases definen el comportamiento.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Idem.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Idem.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Idem.' },
    ],
  },
  {
    id: 'login-button',
    name: 'LoginButton',
    category: 'navegacion',
    importPath: '@/components/LoginButton',
    description:
      'Botón “Iniciar sesión” reutilizable, amarillo sobre texto azul. Sin wrapper ni animaciones externas — el consumidor decide layout.',
    usedIn: ['HomeHero', 'Agenda'],
    props: [
      {
        name: 'onClick',
        type: '() => void',
        required: true,
        description: 'Acción al pulsar.',
      },
      {
        name: 'size',
        type: '"sm" | "md"',
        defaultValue: '"sm"',
        description: 'Tamaño visual. sm escala con vertical-tablet.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Overrides puntuales (por ejemplo por breakpoint).',
      },
      {
        name: 'label',
        type: 'string',
        defaultValue: '"Iniciar sesión"',
        description: 'Texto del botón (i18n del consumidor).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'sm: text-xs · px-3.5 · py-1.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'sm: text-sm · px-5 · py-1.5 (escalado).',
      },
      { breakpoint: 'horizontal-mobile', behavior: 'sm: text-xs (no escala).' },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'sm: text-xs (no escala).',
      },
    ],
  },

  /* ─── Agenda y evento ─────────────────────────────── */
  {
    id: 'when-tabs',
    name: 'WhenTabs',
    category: 'agenda',
    importPath: '@/components/WhenTabs',
    description:
      'Segmented control de rango temporal para la Agenda: Esta semana · Este mes · 3 meses. Layout grid 3 columnas con pills.',
    usedIn: ['Agenda'],
    props: [
      {
        name: 'value',
        type: '"semana" | "proxima-semana" | "mes" | "trimestre"',
        required: true,
        description: 'Tab activo.',
      },
      {
        name: 'onChange',
        type: '(key: WhenKey) => void',
        required: true,
        description: 'Callback al cambiar de rango.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clases extra para el contenedor exterior.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'text-[11px], grid-cols-3, alto mínimo 36px.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'text-sm (escalado).' },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Como vertical-mobile, texto compacto.',
      },
      { breakpoint: 'horizontal-desktop', behavior: 'text-sm.' },
    ],
    notes: [
      'Pill activa: bg km0-blue-600 · texto km0-yellow-400. Nunca usar otros colores.',
    ],
  },
  {
    id: 'event-card',
    name: 'EventCard',
    category: 'agenda',
    importPath: '@/components/EventCard',
    description:
      'Tarjeta resumen de evento en la lista de Agenda. Muestra título, descripción corta, fecha/hora/lugar, tags y badge de precio/gratis.',
    usedIn: ['Agenda'],
    props: [
      {
        name: 'evento',
        type: 'Evento',
        required: true,
        description: 'Objeto Evento del API event-query.',
      },
      {
        name: 'index',
        type: 'number',
        required: true,
        description: 'Índice en la lista (usado para staggered fade-in).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'p-3, título text-sm, iconos 12px.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Mismo layout (no escala el card en lista).',
      },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Igual — la lista decide cuántas columnas.',
      },
    ],
    notes: [
      'Tags se truncan a 3 (slice(0, 3)).',
      'Badge gratis (accent) vs precio en € (secondary).',
    ],
  },

  /* ─── Cabeceras ───────────────────────────────────── */
  {
    id: 'home-hero',
    name: 'HomeHero',
    category: 'cabecera',
    importPath: '@/components/HomeHero',
    description:
      'Header superior compartido por Home y pantallas interiores (Agenda, Chat). Skyline + escudo + nombre de ciudad + logo KM0 + (opcional) back + login + campana. Slot inferior con UserGreeting o contenido custom.',
    usedIn: ['Home (vía HomeContent)', 'Agenda', 'Chat'],
    props: [
      {
        name: 'cityName',
        type: 'string',
        required: true,
        description: 'Nombre de la ciudad/municipio.',
      },
      {
        name: 'hasAlerts',
        type: 'boolean',
        required: true,
        description: 'Si true, la campana muestra dot coral.',
      },
      {
        name: 'onToggleAlerts',
        type: '() => void',
        required: true,
        description: 'Abre/cierra el overlay de notificaciones.',
      },
      {
        name: 'showLogin',
        type: 'boolean',
        required: true,
        description: 'Si true, muestra el LoginButton.',
      },
      {
        name: 'onLogin',
        type: '() => void',
        required: true,
        description: 'Acción del login.',
      },
      {
        name: 'onBack',
        type: '() => void',
        description:
          'Si se pasa, muestra el botón Back amarillo a la izquierda del escudo (pantallas interiores).',
      },
      {
        name: 'backAriaLabel',
        type: 'string',
        defaultValue: '"Volver"',
        description: 'Aria label del back.',
      },
      {
        name: 'showGreeting',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Oculta el UserGreeting cuando se pone false.',
      },
      {
        name: 'greetingSlot',
        type: 'ReactNode',
        description:
          'Sustituye al UserGreeting (p.ej. ScreenTitle en Agenda/Chat) manteniendo la misma altura.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'pt-2/pb-1, escudo 12×12, logo h-4, h1 text-lg.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Escudo 14×14, logo h-5, padding cómodo.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior:
          'Se vuelve absolute inset-0 (fondo del body). Escudo 7×7, logo h-3, h1 text-sm en línea.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'absolute inset-0 con contenido más amplio.',
      },
    ],
    notes: [
      'En landscape el Hero es FONDO del body — el contenido del Home queda por encima vía z-10.',
      'Si pasas greetingSlot, NO pongas showGreeting=false: el wrapper de fondo se preserva por la condición `greetingSlot || showGreeting`.',
    ],
  },
  {
    id: 'user-greeting',
    name: 'UserGreeting',
    category: 'cabecera',
    importPath: '@/components/UserGreeting',
    description:
      'Saludo con avatar, nombre, puntos y barra de progreso al siguiente nivel. Se renderiza dentro del slot inferior de HomeHero cuando hay sesión.',
    usedIn: ['HomeHero (slot por defecto)'],
    props: [
      {
        name: 'name',
        type: 'string | null',
        description: "Nombre a saludar; si vacío, solo 'Hola'.",
      },
      {
        name: 'points',
        type: 'number',
        required: true,
        description: 'Puntos actuales del usuario.',
      },
      {
        name: 'nextLevel',
        type: 'number',
        required: true,
        description: 'Umbral del siguiente nivel (para la barra).',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clases extra (override de layout).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Avatar 10×10, texto sm, tarjeta puntos 125px mín.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Avatar 12×12, texto base, padding más cómodo.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Avatar 9×9, texto xs/[11px], tarjeta px-2.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Como vertical-mobile (no se escala más).',
      },
    ],
    notes: [
      'Maquetación pura: NO consume useAuth. El consumidor pasa los datos.',
      "Hoy hardcodeado a 'Albert / 1259 / 3000' en HomeHero — pendiente de conectar a sesión real.",
    ],
  },
  {
    id: 'screen-title',
    name: 'ScreenTitle',
    category: 'cabecera',
    importPath: '@/components/ScreenTitle',
    description:
      'Sustituto del UserGreeting para pantallas interiores (Agenda, Chat). Mantiene la MISMA altura visual que UserGreeting para que el Hero no cambie de tamaño. Muestra icono + título + día de la semana + fecha destacada (Hoy DD mes).',
    usedIn: [
      'Agenda (vía HomeHero.greetingSlot)',
      'Chat (vía HomeHero.greetingSlot)',
    ],
    props: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: "Título de la pantalla (p.ej. 'Agenda').",
      },
      {
        name: 'date',
        type: 'Date',
        defaultValue: 'new Date()',
        description: 'Fecha a mostrar; por defecto, hoy.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clases extra del contenedor.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Icono 5×5 en burbuja 10×10, título text-sm, fecha text-2xl.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Burbuja 12×12, título text-base, fecha text-4xl.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Burbuja 9×9, título text-xs, fecha compacta.',
      },
      { breakpoint: 'horizontal-desktop', behavior: 'Como vertical-tablet.' },
    ],
    notes: [
      'NO incluye botón back — el back vive en HomeHero (prop onBack). ScreenTitle es solo el contenido del slot.',
      'Se inyecta vía HomeHero.greetingSlot, NO se monta suelto en ninguna pantalla.',
    ],
  },
  {
    id: 'notification-bell',
    name: 'NotificationBell',
    category: 'cabecera',
    importPath: '@/components/NotificationBell',
    description:
      'Campana con dot de estado (coral si hay no leídas, beige si no). Se comporta como botón si recibe onClick; si no, como icono decorativo.',
    usedIn: ['HomeHero'],
    props: [
      {
        name: 'hasAlerts',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Pinta el dot coral cuando hay notificaciones no leídas.',
      },
      {
        name: 'onClick',
        type: '() => void',
        description: 'Si se pasa, el componente se renderiza como <button>.',
      },
      {
        name: 'ariaLabel',
        type: 'string',
        defaultValue: '"Notifications"',
        description: 'Aria label (i18n del consumidor).',
      },
      { name: 'className', type: 'string', description: 'Clases extra.' },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Botón 10×10, icono 24px (no escala).',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Igual.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Igual.' },
    ],
  },

  /* ─── Home ────────────────────────────────────────── */
  {
    id: 'home-content',
    name: 'HomeContent',
    category: 'home',
    importPath: '@/components/HomeContent',
    description:
      'Orquestador interno del Home reutilizado por los frames portrait y landscape de la página Home. Compone HomeHero + HomeModules + PromoSection + ComerciosSection + BottomTabs. NO conoce auth, router ni hooks: todo entra por props.',
    usedIn: ['Home'],
    props: [
      {
        name: 'cityName',
        type: 'string',
        required: true,
        description: 'Ciudad mostrada en el HomeHero.',
      },
      {
        name: 'hasAlerts',
        type: 'boolean',
        required: true,
        description: 'Pasa al HomeHero/NotificationBell.',
      },
      {
        name: 'onToggleAlerts',
        type: '() => void',
        required: true,
        description: 'Abre overlay de notificaciones.',
      },
      {
        name: 'modules',
        type: 'HomeModule[]',
        required: true,
        description: 'Módulos a renderizar en el grid (3 ideal).',
      },
      {
        name: 'promos',
        type: 'Promo[]',
        required: true,
        description: 'Promos del PromoCarousel.',
      },
      {
        name: 'comercios',
        type: 'Comercio[]',
        required: true,
        description: 'Comercios del ComercioCarousel.',
      },
      {
        name: 'activeTab',
        type: 'HomeTab',
        required: true,
        description: 'Tab activo del BottomTabs.',
      },
      {
        name: 'onTabChange',
        type: '(t: HomeTab) => void',
        required: true,
        description: 'Callback al cambiar tab.',
      },
      {
        name: 'showLogin',
        type: 'boolean',
        required: true,
        description:
          'Si true, hay botón login (CTA central portrait + en hero landscape).',
      },
      {
        name: 'onLogin',
        type: '() => void',
        required: true,
        description: 'Acción login.',
      },
      {
        name: 'showProfile',
        type: 'boolean',
        required: true,
        description: 'Si true, el tab Perfil va a /profile (no a /login).',
      },
      {
        name: 'onProfile',
        type: '() => void',
        required: true,
        description: 'Acción tab Perfil con sesión.',
      },
      {
        name: 'onSeeAllComercios',
        type: '() => void',
        description: "Acción del link 'Ver todos' en ComerciosSection.",
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior:
          'Columna única: hero / módulos / promos / comercios apilados con justify-evenly.',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Igual que vertical-mobile (la página clampa el ancho).',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior:
          'Hero como fondo absoluto, body en grid 2-col compacto (promos | comercios).',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Hero como fondo, body en grid 2-col cómodo.',
      },
    ],
    notes: [
      'Solo lo monta `src/pages/Home.tsx` (dentro de los wrappers portrait/landscape).',
      'Los borders negros visibles son DEBUG temporal — no quitar sin consultar.',
    ],
  },
  {
    id: 'home-modules',
    name: 'HomeModules',
    category: 'home',
    importPath: '@/components/HomeModules',
    description:
      'Grid de accesos rápidos estilo Glovo recoloreado a marca KM0: banda azul con curva orgánica + círculos blancos con icono coloreado + pill de label flotando bajo el círculo. Cada módulo es togglable (active/inactive).',
    usedIn: ['Home (vía HomeContent)'],
    props: [
      {
        name: 'modules',
        type: 'HomeModule[]',
        required: true,
        description:
          'Lista de módulos. Ids soportados: chat · agenda · ajuntament · punts · cupons · comerc.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clases extra del wrapper.',
      },
    ],
    responsive: [],
    notes: [
      'Color del icono por módulo está hardcodeado en ICON_COLOR (azul/teal/yellow/coral). Cambiarlo allí, no por props.',
      "El módulo 'central' tenía emphasized, hoy desactivado (todos al mismo tamaño).",
    ],
  },
  {
    id: 'promo-section',
    name: 'PromoSection',
    category: 'home',
    importPath: '@/components/PromoSection',
    description:
      "Wrapper visual de la sección 'Promos y eventos destacados': título + PromoCarousel.",
    usedIn: ['Home (vía HomeContent)'],
    props: [
      {
        name: 'promos',
        type: 'Promo[]',
        required: true,
        description: 'Promos a mostrar en el carrusel.',
      },
      {
        name: 'title',
        type: 'string',
        defaultValue: '"Promos y eventos destacados"',
        description: 'Título de la sección.',
      },
      {
        name: 'animationDelay',
        type: 'number',
        defaultValue: '0.26',
        description: 'Delay del fade-in (segundos).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Título text-sm, separación mb compacta.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Título text-base.' },
      {
        breakpoint: 'horizontal-mobile',
        behavior:
          'Título text-xs, altura header 6, flex-col para que el carrusel ocupe lo que sobra.',
      },
      { breakpoint: 'horizontal-desktop', behavior: 'Título text-lg.' },
    ],
  },
  {
    id: 'promo-carousel',
    name: 'PromoCarousel',
    category: 'home',
    importPath: '@/components/PromoCarousel',
    description:
      'Carrusel de promos/eventos con drag horizontal (framer-motion), flechas condicionales (no first/no last) y dots clicables.',
    usedIn: ['PromoSection'],
    props: [
      {
        name: 'promos',
        type: 'Promo[]',
        required: true,
        description:
          'Lista de promos. Cada una define gradient + 3 títulos con color.',
      },
    ],
    responsive: [
      { breakpoint: 'vertical-mobile', behavior: 'Aspect-[2/1].' },
      { breakpoint: 'vertical-tablet', behavior: 'Aspect-[16/9].' },
      {
        breakpoint: 'horizontal-mobile',
        behavior: 'Aspect libre, ocupa flex-1 del padre.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Aspect libre, ocupa flex-1 del padre.',
      },
    ],
    notes: [
      "Componente 'tonto': no llama a API ni router; toda la data viene de @/data/promos.",
    ],
  },
  {
    id: 'comercios-section',
    name: 'ComerciosSection',
    category: 'home',
    importPath: '@/components/ComerciosSection',
    description:
      "Wrapper visual de la sección 'Esto es para ti': icono cupón + título + link 'Ver todos' + ComercioCarousel.",
    usedIn: ['Home (vía HomeContent)'],
    props: [
      {
        name: 'comercios',
        type: 'Comercio[]',
        required: true,
        description: 'Comercios del carrusel.',
      },
      {
        name: 'title',
        type: 'string',
        defaultValue: '"Esto es para ti"',
        description: 'Título de la sección.',
      },
      {
        name: 'onSeeAll',
        type: '() => void',
        description: "Acción del link 'Ver todos'.",
      },
      {
        name: 'animationDelay',
        type: 'number',
        defaultValue: '0.34',
        description: 'Delay del fade-in (segundos).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Icono cupón 12×12 a la izquierda del título, link text-xs.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Título y link text-base.' },
      {
        breakpoint: 'horizontal-mobile',
        behavior:
          'Icono cupón oculto, link text-xs, fondo white/30 rounded-xl en torno al carrusel.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior:
          'Como vertical-tablet con fondo white/30 alrededor del carrusel.',
      },
    ],
  },
  {
    id: 'comercio-carousel',
    name: 'ComercioCarousel',
    category: 'home',
    importPath: '@/components/ComercioCarousel',
    description:
      'Carrusel paginado de logos de comercios. Cada página es una grid de 4 columnas con drag horizontal y dots clicables. Rellena huecos vacíos para mantener alineación.',
    usedIn: ['ComerciosSection'],
    props: [
      {
        name: 'comercios',
        type: 'Comercio[]',
        required: true,
        description: 'Lista completa; el componente se encarga de paginar.',
      },
      {
        name: 'perPage',
        type: 'number',
        defaultValue: '4',
        description: 'Comerciantes por página.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Logos clamp(36-56px), label text-[10px].',
      },
      {
        breakpoint: 'vertical-tablet',
        behavior: 'Logos 56×56, padding más cómodo.',
      },
      {
        breakpoint: 'horizontal-mobile',
        behavior:
          'Logos 36×36, layout flex-col para que el carrusel ocupe el alto del padre.',
      },
      {
        breakpoint: 'horizontal-desktop',
        behavior: 'Como vertical-mobile con más aire vertical.',
      },
    ],
  },

  /* ─── Chat ────────────────────────────────────────── */
  {
    id: 'voice-recorder',
    name: 'VoiceRecorder',
    category: 'chat',
    importPath: '@/components/VoiceRecorder',
    description:
      "Caja de grabación de voz con Web Speech API. Muestra texto 'Escuchando…', barras animadas, preview parcial truncada y botón Stop. Se monta condicionalmente en lugar del input cuando el usuario activa el micrófono.",
    usedIn: ['Chat (barra de entrada)'],
    props: [
      {
        name: 'onTranscript',
        type: '(text: string) => void',
        required: true,
        description:
          'Se llama con el texto final cuando el usuario pulsa Stop y hay resultado.',
      },
      {
        name: 'onCancel',
        type: '() => void',
        required: true,
        description:
          'Se llama si Stop sin texto, o si el navegador no soporta SpeechRecognition, o en error.',
      },
      {
        name: 'lang',
        type: '"ca" | "es" | "en" | string',
        defaultValue: '"es"',
        description:
          'Idioma de reconocimiento (mapeado a ca-ES / es-ES / en-GB).',
      },
    ],
    responsive: [
      { breakpoint: 'vertical-mobile', behavior: 'Pill horizontal completa.' },
      { breakpoint: 'vertical-tablet', behavior: 'Igual.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Igual.' },
    ],
    notes: [
      'Requiere window.SpeechRecognition o webkitSpeechRecognition. Si no existe, llama a onCancel y muestra alert.',
      'En la preview del catálogo se renderiza un stub porque pedir micro en docs no tiene sentido.',
    ],
  },

  /* ─── Auth ────────────────────────────────────────── */
  {
    id: 'social-auth-buttons',
    name: 'SocialAuthButtons',
    category: 'auth',
    importPath: '@/components/SocialAuthButtons',
    description:
      'Par de botones Google + Apple (grid 2 cols) que disparan lovable.auth.signInWithOAuth. Compartido por signup y login. Maneja loading y error con toast.',
    usedIn: ['Login', '(futuro) Signup'],
    props: [
      {
        name: 'redirectTo',
        type: 'string',
        defaultValue: '"/home"',
        description:
          'Path al que volver tras el OAuth (se combina con window.location.origin).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Grid 2 cols, altura h-12, texto sm.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Igual.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Igual.' },
    ],
  },

  /* ─── Overlays ────────────────────────────────────── */
  {
    id: 'notifications-overlay',
    name: 'NotificationsOverlay',
    category: 'overlay',
    importPath: '@/components/NotificationsOverlay',
    description:
      'Overlay deslizante que cubre el frame actual (absolute inset-0, z-50) con la lista de notificaciones. Cada item con dot de estado, título, descripción, tiempo y CTA. Pulsar item navega al link y marca como leído.',
    usedIn: ['Home'],
    props: [
      {
        name: 'open',
        type: 'boolean',
        required: true,
        description: 'Controla la visibilidad (con AnimatePresence).',
      },
      {
        name: 'notifications',
        type: 'AppNotification[]',
        required: true,
        description: 'Lista a mostrar (orden = orden visual).',
      },
      {
        name: 'onClose',
        type: '() => void',
        required: true,
        description: 'Cerrar overlay.',
      },
      {
        name: 'onMarkRead',
        type: '(id: string) => void',
        required: true,
        description: 'Marcar una notificación como leída.',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior: 'Cubre el frame del Home (rounded-3xl heredado).',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Igual.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Igual.' },
    ],
    notes: [
      'Debe montarse DENTRO de un padre `relative` (el frame del Home lo es).',
      "Estado vacío: muestra mensaje 'No tienes notificaciones'.",
    ],
  },

  /* ─── Idioma ──────────────────────────────────────── */
  {
    id: 'language-card',
    name: 'LanguageCard',
    category: 'idioma',
    importPath: '@/components/LanguageCard',
    description:
      'Card de selección de idioma. Bandera (emoji o imagen) + nombre + descripción + flecha. Estados: idle, selected (borde amarillo), disabled (gris).',
    usedIn: ['Language (Index)'],
    props: [
      {
        name: 'flag',
        type: 'string',
        required: true,
        description: 'Emoji o URL de bandera (según flagIsImage).',
      },
      {
        name: 'flagIsImage',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Si true, flag se renderiza como <img>; si no, como emoji.',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Nombre del idioma.',
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: "Línea secundaria (p.ej. 'Català').",
      },
      {
        name: 'selected',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Estado seleccionado.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'No clicable, grayscale.',
      },
      {
        name: 'onClick',
        type: '() => void',
        description: 'Acción al pulsar (ignorada si disabled).',
      },
      {
        name: 'style',
        type: 'CSSProperties',
        description:
          'Override puntual de estilos inline (p.ej. animation-delay para stagger).',
      },
    ],
    responsive: [
      {
        breakpoint: 'vertical-mobile',
        behavior:
          'Card completo ancho disponible, bandera 12×12, nombre text-lg.',
      },
      { breakpoint: 'vertical-tablet', behavior: 'Igual.' },
      { breakpoint: 'horizontal-mobile', behavior: 'Igual.' },
      { breakpoint: 'horizontal-desktop', behavior: 'Igual.' },
    ],
  },
]

export const componentsByCategory = (): Record<
  ComponentCategory,
  ComponentSpec[]
> => {
  const acc = {} as Record<ComponentCategory, ComponentSpec[]>
  ;(Object.keys(CATEGORY_LABELS) as ComponentCategory[]).forEach(
    (c) => (acc[c] = [])
  )
  componentsCatalog.forEach((c) => acc[c.category].push(c))
  return acc
}
