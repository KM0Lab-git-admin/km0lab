/**
 * i18n — diccionario plano de strings de la app KM0 LAB.
 *
 * Decisión: helper propio mínimo (no i18next) — la app tiene pocos
 * strings y el diccionario cabe en un único archivo tipado.
 *
 * Uso:
 *   const { lang } = useLang();
 *   t("home.sections.events", lang);
 */

export type Lang = 'ca' | 'es' | 'en'

export const LANGS: Lang[] = ['ca', 'es', 'en']

type Dict = Record<Lang, string>

const D = {
  // ── Common ───────────────────────────────────────────────
  'common.back': { ca: 'Enrere', es: 'Volver', en: 'Back' } as Dict,
  'common.continue': {
    ca: 'CONTINUAR',
    es: 'CONTINUAR',
    en: 'CONTINUE',
  } as Dict,
  'common.loading': {
    ca: 'Carregant…',
    es: 'Cargando…',
    en: 'Loading…',
  } as Dict,
  'common.points': { ca: 'punts', es: 'puntos', en: 'points' } as Dict,
  'common.previous': { ca: 'Anterior', es: 'Anterior', en: 'Previous' } as Dict,
  'common.next': { ca: 'Següent', es: 'Siguiente', en: 'Next' } as Dict,

  // ── Language screen ──────────────────────────────────────
  'language.title': {
    ca: 'Tria el teu idioma',
    es: 'Escoge tu idioma',
    en: 'Choose your language',
  } as Dict,

  // ── Onboarding ───────────────────────────────────────────
  'onboarding.skip': { ca: 'SALTAR', es: 'SALTAR', en: 'SKIP' } as Dict,
  'onboarding.finish': { ca: 'INICI', es: 'INICIO', en: 'START' } as Dict,

  // ── Postal code ──────────────────────────────────────────
  'postal.title': {
    ca: 'INTRODUEIX EL TEU CODI POSTAL',
    es: 'INTRODUCE TU CÓDIGO POSTAL',
    en: 'ENTER YOUR POSTAL CODE',
  } as Dict,
  'postal.subtitle': {
    ca: 'Descobreix comerços i serveis al teu barri',
    es: 'Descubre comercios y servicios en tu barrio',
    en: 'Discover shops and services in your neighborhood',
  } as Dict,
  'postal.placeholder': { ca: '08380', es: '08380', en: '08380' } as Dict,
  'postal.error_numeric': {
    ca: 'Només es permeten números',
    es: 'Solo se permiten números',
    en: 'Only numbers are allowed',
  } as Dict,
  'postal.error_notfound': {
    ca: 'No es reconeix aquest codi postal',
    es: 'No se reconoce este código postal',
    en: 'This postal code is not recognized',
  } as Dict,

  // ── Login ────────────────────────────────────────────────
  'login.title': {
    ca: "Entra o registra't",
    es: 'Entra o regístrate',
    en: 'Sign in or sign up',
  } as Dict,
  'login.subtitle': {
    ca: "T'enviarem un codi al teu correu",
    es: 'Te enviaremos un código a tu correo',
    en: "We'll send a code to your email",
  } as Dict,
  'login.email_placeholder': {
    ca: 'Correu electrònic',
    es: 'Email',
    en: 'Email',
  } as Dict,
  'login.submit': { ca: 'Continuar', es: 'Continuar', en: 'Continue' } as Dict,
  'login.submitting': {
    ca: 'Enviant codi…',
    es: 'Enviando código…',
    en: 'Sending code…',
  } as Dict,
  'login.divider': {
    ca: 'pròximament',
    es: 'próximamente',
    en: 'coming soon',
  } as Dict,
  'login.error_email': {
    ca: 'Introdueix el teu correu.',
    es: 'Introduce tu email.',
    en: 'Enter your email.',
  } as Dict,
  'login.toast_sent': {
    ca: "T'hem enviat un codi per correu",
    es: 'Te hemos enviado un código por email',
    en: "We've sent you a code by email",
  } as Dict,

  // ── OTP / Check email ────────────────────────────────────
  'otp.title': {
    ca: 'Revisa el teu correu',
    es: 'Revisa tu correo',
    en: 'Check your email',
  } as Dict,
  'otp.subtitle': {
    ca: 'Hem enviat un codi de 4 dígits a',
    es: 'Hemos enviado un código de 4 dígitos a',
    en: 'We sent a 4-digit code to',
  } as Dict,
  'otp.resend': {
    ca: 'Reenviar codi',
    es: 'Reenviar código',
    en: 'Resend code',
  } as Dict,
  'otp.resending': {
    ca: 'Reenviant…',
    es: 'Reenviando…',
    en: 'Resending…',
  } as Dict,
  'otp.resend_in': {
    ca: 'Reenviar codi en',
    es: 'Reenviar código en',
    en: 'Resend code in',
  } as Dict,
  'otp.toast_resent': {
    ca: 'Codi reenviat',
    es: 'Código reenviado',
    en: 'Code resent',
  } as Dict,
  'otp.toast_wrong': {
    ca: 'Codi incorrecte. Torna-ho a provar.',
    es: 'Código incorrecto. Inténtalo de nuevo.',
    en: 'Wrong code. Try again.',
  } as Dict,
  'otp.toast_resend_fail': {
    ca: "No s'ha pogut reenviar. Prova-ho més tard.",
    es: 'No se pudo reenviar. Inténtalo más tarde.',
    en: "Couldn't resend. Try again later.",
  } as Dict,
  'otp.welcome': {
    ca: 'Benvingut/da!',
    es: '¡Bienvenido!',
    en: 'Welcome!',
  } as Dict,
  'otp.footer_hint': {
    ca: 'No el trobes? Mira a la carpeta de spam o promocions.',
    es: '¿No lo encuentras? Mira en spam o promociones.',
    en: "Can't find it? Check spam or promotions.",
  } as Dict,

  // ── Home ─────────────────────────────────────────────────
  'home.hello': { ca: 'Hola', es: 'Hola', en: 'Hi' } as Dict,
  'home.greeting_subtitle': {
    ca: 'Gràcies per recolzar el comerç local',
    es: 'Gracias por apoyar lo local',
    en: 'Thanks for supporting local',
  } as Dict,
  'home.section.quick': {
    ca: 'Accessos ràpids',
    es: 'Accesos rápidos',
    en: 'Quick access',
  } as Dict,
  'home.section.events': {
    ca: 'Esdeveniments destacats',
    es: 'Eventos destacados',
    en: 'Featured events',
  } as Dict,
  'home.section.shops': {
    ca: 'Descobreix el nostre',
    es: 'Descubre lo nuestro',
    en: 'Discover our locals',
  } as Dict,
  'home.section.coupons': {
    ca: 'Promos per a tu',
    es: 'Promos para ti',
    en: 'Promos for you',
  } as Dict,
  'home.action.see_all_m': {
    ca: "Veure'ls tots",
    es: 'Ver todos',
    en: 'See all',
  } as Dict,
  'home.action.see_all_f': {
    ca: 'Veure-les totes',
    es: 'Ver todas',
    en: 'See all',
  } as Dict,
  'home.login_cta': {
    ca: 'Iniciar sessió',
    es: 'Iniciar sesión',
    en: 'Sign in',
  } as Dict,

  // ── Home · Missió del barri (spec-home-c) ───────────────
  'home.greeting.registered': {
    ca: 'Bon dia, {name} 👋',
    es: '¡Buenos días, {name}! 👋',
    en: 'Good morning, {name} 👋',
  } as Dict,
  'home.greeting.guest': {
    ca: 'Hola! 👋',
    es: '¡Hola! 👋',
    en: 'Hi! 👋',
  } as Dict,
  'home.subtitle.registered': {
    ca: 'El teu barri, més a prop',
    es: 'Tu barrio, más cerca',
    en: 'Your neighborhood, closer',
  } as Dict,
  'home.subtitle.guest': {
    ca: 'Descobreix i comença a guanyar punts',
    es: 'Descubre y empieza a ganar puntos',
    en: 'Discover and start earning points',
  } as Dict,
  'home.points.level': {
    ca: 'Nivell {n}',
    es: 'Nivel {n}',
    en: 'Level {n}',
  } as Dict,
  'home.points.toReward': {
    ca: 'A {n} punts de la propera recompensa: {reward}',
    es: 'A {n} puntos de la próxima recompensa: {reward}',
    en: '{n} points to your next reward: {reward}',
  } as Dict,
  'home.welcome.title': {
    ca: 'Benvingut/da a KM0 LAB! 🎉',
    es: '¡Bienvenido/a a KM0 LAB! 🎉',
    en: 'Welcome to KM0 LAB! 🎉',
  } as Dict,
  'home.welcome.points': {
    ca: 'Has guanyat 100 punts de benvinguda',
    es: 'Has ganado 100 puntos de bienvenida',
    en: 'You earned 100 welcome points',
  } as Dict,
  'home.join.title': {
    ca: "Registra't i comença a guanyar 🎁",
    es: 'Regístrate y empieza a ganar 🎁',
    en: 'Sign up and start earning 🎁',
  } as Dict,
  'home.join.body': {
    ca: "Acumula punts als comerços del poble i bescanvia'ls per vals i descomptes.",
    es: 'Acumula puntos en los comercios del pueblo y canjéalos por vales y descuentos.',
    en: 'Earn points at local shops and redeem them for vouchers and discounts.',
  } as Dict,
  'home.join.cta': {
    ca: 'Crea el teu compte',
    es: 'Crea tu cuenta',
    en: 'Create your account',
  } as Dict,
  'home.join.mini': {
    ca: 'Només et cal un correu · 30 segons',
    es: 'Solo necesitas un email · 30 segundos',
    en: 'Just your email · 30 seconds',
  } as Dict,
  'home.earn.title': {
    ca: 'Com guanyar punts',
    es: 'Cómo ganar puntos',
    en: 'How to earn points',
  } as Dict,
  'home.earn.qr': {
    ca: 'Escaneja el QR als comerços adherits',
    es: 'Escanea el QR en los comercios adheridos',
    en: 'Scan the QR at partner shops',
  } as Dict,
  'home.earn.scanCta': {
    ca: 'Escaneja un QR',
    es: 'Escanea un QR',
    en: 'Scan a QR',
  } as Dict,
  'home.earn.soon': {
    ca: 'Ben aviat, més formes de guanyar punts',
    es: 'Muy pronto, más formas de ganar puntos',
    en: 'More ways to earn points coming soon',
  } as Dict,
  'home.earn.today': { ca: 'avui', es: 'hoy', en: 'today' } as Dict,
  'home.earn.action.shop.title': {
    ca: 'Visita un comerç adherit',
    es: 'Visita un comercio adherido',
    en: 'Visit a partner shop',
  } as Dict,
  'home.earn.action.shop.subtitle': {
    ca: "Registra't per desbloquejar",
    es: 'Regístrate para desbloquear',
    en: 'Sign up to unlock',
  } as Dict,
  'home.earn.action.shop.reward': {
    ca: 'Guanya {n} punts per compra',
    es: 'Gana {n} puntos por compra',
    en: 'Earn {n} points per purchase',
  } as Dict,
  'home.earn.action.event.title': {
    ca: "Apunta't a un esdeveniment",
    es: 'Apúntate a un evento',
    en: 'Join an event',
  } as Dict,
  'home.earn.action.event.subtitle': {
    ca: "Registra't per desbloquejar",
    es: 'Regístrate para desbloquear',
    en: 'Sign up to unlock',
  } as Dict,
  'home.earn.action.event.reward': {
    ca: 'Guanya {n} punts per assistència',
    es: 'Gana {n} puntos por asistencia',
    en: 'Earn {n} points per attendance',
  } as Dict,

  'home.redeem.title': {
    ca: 'Bescanvia amb punts',
    es: 'Canjea con puntos',
    en: 'Redeem with points',
  } as Dict,
  'home.redeem.cost': {
    ca: '{n} pts',
    es: '{n} pts',
    en: '{n} pts',
  } as Dict,
  'home.redeem.locked': {
    ca: "Registra't per bescanviar",
    es: 'Regístrate para canjear',
    en: 'Sign up to redeem',
  } as Dict,

  // ── BottomTabs ───────────────────────────────────────────
  'tabs.home': { ca: 'Inici', es: 'Inicio', en: 'Home' } as Dict,
  'tabs.info': { ca: 'Informació', es: 'Información', en: 'Info' } as Dict,
  'tabs.offers': { ca: 'Ofertes', es: 'Ofertas', en: 'Offers' } as Dict,
  'tabs.profile': { ca: 'Perfil', es: 'Perfil', en: 'Profile' } as Dict,

  // ── Module labels ────────────────────────────────────────
  'module.agenda': { ca: 'Agenda', es: 'Agenda', en: 'Agenda' } as Dict,
  'module.chat': { ca: 'KM0 CHAT', es: 'KM0 CHAT', en: 'KM0 CHAT' } as Dict,
  'module.ajuntament': {
    ca: 'Ajuntament',
    es: 'Ayuntamiento',
    en: 'Town hall',
  } as Dict,
  'module.comerc': { ca: 'Comerços', es: 'Comercios', en: 'Shops' } as Dict,
  'module.punts': { ca: 'Punts', es: 'Puntos', en: 'Points' } as Dict,
  'module.cupons': { ca: 'Cupons', es: 'Cupones', en: 'Coupons' } as Dict,
  'module.noticias': { ca: 'Notícies', es: 'Noticias', en: 'News' } as Dict,
  'module.servicios': {
    ca: 'Serveis',
    es: 'Servicios',
    en: 'Services',
  } as Dict,

  // ── Profile ──────────────────────────────────────────────
  'profile.title': {
    ca: 'El meu perfil',
    es: 'Mi perfil',
    en: 'My profile',
  } as Dict,
  'profile.subtitle': {
    ca: 'Actualitza les teves dades',
    es: 'Actualiza tus datos',
    en: 'Update your details',
  } as Dict,
  'profile.first_name': { ca: 'Nom', es: 'Nombre', en: 'First name' } as Dict,
  'profile.first_name_ph': {
    ca: 'El teu nom',
    es: 'Tu nombre',
    en: 'Your first name',
  } as Dict,
  'profile.last_name': {
    ca: 'Cognoms',
    es: 'Apellidos',
    en: 'Last name',
  } as Dict,
  'profile.last_name_ph': {
    ca: 'Els teus cognoms',
    es: 'Tus apellidos',
    en: 'Your last name',
  } as Dict,
  'profile.email': { ca: 'Correu', es: 'Email', en: 'Email' } as Dict,
  'profile.postal': {
    ca: 'C. postal',
    es: 'C. postal',
    en: 'Postal code',
  } as Dict,
  'profile.town': { ca: 'Població', es: 'Población', en: 'Town' } as Dict,
  'profile.town_empty': {
    ca: 'Sense coincidència',
    es: 'Sin coincidencia',
    en: 'No match',
  } as Dict,
  'profile.town_hint': {
    ca: "S'omple amb el CP",
    es: 'Se rellena con el CP',
    en: 'Filled by postcode',
  } as Dict,
  'profile.save': {
    ca: 'Desar canvis',
    es: 'Guardar cambios',
    en: 'Save changes',
  } as Dict,
  'profile.saving': { ca: 'Desant…', es: 'Guardando…', en: 'Saving…' } as Dict,
  'profile.logout': {
    ca: 'Tancar sessió',
    es: 'Cerrar sesión',
    en: 'Sign out',
  } as Dict,
  'profile.toast_saved': {
    ca: 'Perfil actualitzat',
    es: 'Perfil actualizado',
    en: 'Profile updated',
  } as Dict,
  'profile.toast_save_fail': {
    ca: "No s'ha pogut desar",
    es: 'No se pudo guardar',
    en: "Couldn't save",
  } as Dict,
  'profile.toast_load_fail': {
    ca: "No s'ha pogut carregar el perfil",
    es: 'No se pudo cargar el perfil',
    en: "Couldn't load profile",
  } as Dict,
  'profile.toast_logout': {
    ca: 'Sessió tancada',
    es: 'Sesión cerrada',
    en: 'Signed out',
  } as Dict,
  'profile.language': { ca: 'Idioma', es: 'Idioma', en: 'Language' } as Dict,
  'profile.error_max': {
    ca: 'Màxim 100 caràcters',
    es: 'Máximo 100 caracteres',
    en: 'Maximum 100 characters',
  } as Dict,
  'profile.error_postal': {
    ca: 'Codi postal de 5 dígits',
    es: 'Código postal de 5 dígitos',
    en: '5-digit postal code',
  } as Dict,
  'profile.error_invalid': {
    ca: 'Dades no vàlides',
    es: 'Datos no válidos',
    en: 'Invalid data',
  } as Dict,

  // ── Noticias ─────────────────────────────────────────────
  'news.title': { ca: 'Notícies', es: 'Noticias', en: 'News' } as Dict,
  'news.empty.title': {
    ca: 'Encara no hi ha notícies',
    es: 'Todavía no hay noticias',
    en: 'No news yet',
  } as Dict,
  'news.empty.subtitle': {
    ca: 'Torna a mirar més tard.',
    es: 'Vuelve a mirar más tarde.',
    en: 'Check back later.',
  } as Dict,
  'news.error.title': {
    ca: "No s'han pogut carregar les notícies",
    es: 'No se han podido cargar las noticias',
    en: "Couldn't load the news",
  } as Dict,
  'news.error.subtitle': {
    ca: 'Comprova la connexió i torna-ho a provar.',
    es: 'Comprueba la conexión e inténtalo de nuevo.',
    en: 'Check your connection and try again.',
  } as Dict,
  'news.error.retry': {
    ca: 'Tornar a provar',
    es: 'Reintentar',
    en: 'Retry',
  } as Dict,
  'news.detail.source': {
    ca: 'Font original',
    es: 'Fuente original',
    en: 'Original source',
  } as Dict,

  // ── Eventos de hoy ───────────────────────────────────────
  'today.title': { ca: 'Avui', es: 'Hoy', en: 'Today' } as Dict,
  'today.free': { ca: 'Gratuït', es: 'Gratis', en: 'Free' } as Dict,
  'today.empty.title': {
    ca: 'Avui no hi ha esdeveniments',
    es: 'Hoy no hay eventos',
    en: 'No events today',
  } as Dict,
  'today.empty.subtitle': {
    ca: "Torna a mirar l'agenda més tard.",
    es: 'Vuelve a mirar la agenda más tarde.',
    en: 'Check the agenda again later.',
  } as Dict,
  'today.error.title': {
    ca: "No s'han pogut carregar els esdeveniments",
    es: 'No se han podido cargar los eventos',
    en: "Couldn't load events",
  } as Dict,
  'today.error.subtitle': {
    ca: 'Comprova la connexió i torna-ho a provar.',
    es: 'Comprueba la conexión e inténtalo de nuevo.',
    en: 'Check your connection and try again.',
  } as Dict,
  'today.error.retry': {
    ca: 'Tornar a provar',
    es: 'Reintentar',
    en: 'Retry',
  } as Dict,

  // ── Evento (detalle) ─────────────────────────────────────
  'event.when': { ca: 'Quan', es: 'Cuándo', en: 'When' } as Dict,
  'event.where': { ca: 'On', es: 'Dónde', en: 'Where' } as Dict,
  'event.organizer': {
    ca: 'Organitza',
    es: 'Organiza',
    en: 'Organized by',
  } as Dict,
  'event.tags': { ca: 'Etiquetes', es: 'Etiquetas', en: 'Tags' } as Dict,
  'event.description': {
    ca: 'Descripció',
    es: 'Descripción',
    en: 'Description',
  } as Dict,
  'event.source': {
    ca: 'Veure publicació original',
    es: 'Ver publicación original',
    en: 'View original post',
  } as Dict,
  'event.free': { ca: 'Gratuït', es: 'Gratis', en: 'Free' } as Dict,
  'event.family': { ca: 'Familiar', es: 'Familiar', en: 'Family' } as Dict,
  'event.notfound.title': {
    ca: "No hem trobat l'esdeveniment",
    es: 'No hemos encontrado el evento',
    en: 'Event not found',
  } as Dict,
  'event.notfound.subtitle': {
    ca: "Torna a l'agenda i tria un altre.",
    es: 'Vuelve a la agenda y elige otro.',
    en: 'Go back to the agenda and pick another one.',
  } as Dict,
  'event.error.title': {
    ca: "No s'ha pogut carregar l'esdeveniment",
    es: 'No se ha podido cargar el evento',
    en: "Couldn't load the event",
  } as Dict,

  // ── Agenda ───────────────────────────────────────────────
  'agenda.title': { ca: 'Agenda', es: 'Agenda', en: 'Agenda' } as Dict,
  'agenda.back': {
    ca: "Anar a l'inici",
    es: 'Ir al inicio',
    en: 'Go home',
  } as Dict,
  'agenda.when.week': {
    ca: 'Aquesta setmana',
    es: 'Esta semana',
    en: 'This week',
  } as Dict,
  'agenda.when.month': {
    ca: 'Pròxims 30 dies',
    es: 'Próximos 30 días',
    en: 'Next 30 days',
  } as Dict,
  'agenda.when.aria': {
    ca: 'Rang temporal',
    es: 'Rango temporal',
    en: 'Time range',
  } as Dict,
  'agenda.cat.musica': { ca: 'Música', es: 'Música', en: 'Music' } as Dict,
  'agenda.cat.cultura': { ca: 'Cultura', es: 'Cultura', en: 'Culture' } as Dict,
  'agenda.cat.infantil': { ca: 'Infantil', es: 'Infantil', en: 'Kids' } as Dict,
  'agenda.cat.deporte': { ca: 'Esport', es: 'Deporte', en: 'Sports' } as Dict,
  'agenda.cat.talleres': {
    ca: 'Tallers',
    es: 'Talleres',
    en: 'Workshops',
  } as Dict,
  'agenda.cat.fiestas': { ca: 'Festes', es: 'Fiestas', en: 'Parties' } as Dict,
  'agenda.cat.gastronomia': { ca: 'Gastro', es: 'Gastro', en: 'Food' } as Dict,
  'agenda.cat.todos': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
  'agenda.searching': {
    ca: 'Cercant…',
    es: 'Buscando…',
    en: 'Searching…',
  } as Dict,
  'agenda.count.one': { ca: 'esdeveniment', es: 'evento', en: 'event' } as Dict,
  'agenda.count.many': {
    ca: 'esdeveniments',
    es: 'eventos',
    en: 'events',
  } as Dict,
  'agenda.error': {
    ca: "No s'han pogut carregar els esdeveniments.",
    es: 'No se han podido cargar los eventos.',
    en: "Couldn't load events.",
  } as Dict,
  'agenda.empty.title': {
    ca: 'No hem trobat esdeveniments',
    es: 'No hemos encontrado eventos',
    en: 'No events found',
  } as Dict,
  'agenda.empty.hint': {
    ca: 'Prova canviant la data o la categoria.',
    es: 'Prueba cambiando la fecha o la categoría.',
    en: 'Try changing the date or category.',
  } as Dict,
  'agenda.day.today': { ca: 'Avui', es: 'Hoy', en: 'Today' } as Dict,
  'agenda.day.tomorrow': { ca: 'Demà', es: 'Mañana', en: 'Tomorrow' } as Dict,
  'agenda.badge.free': { ca: 'Gratuït', es: 'Gratis', en: 'Free' } as Dict,

  // ── Notifications ────────────────────────────────────────
  'notifications.title': {
    ca: 'Notificacions',
    es: 'Notificaciones',
    en: 'Notifications',
  } as Dict,
  'notifications.close': {
    ca: 'Tancar notificacions',
    es: 'Cerrar notificaciones',
    en: 'Close notifications',
  } as Dict,
  'notifications.loading': {
    ca: 'Carregant notícies…',
    es: 'Cargando noticias…',
    en: 'Loading news…',
  } as Dict,
  'notifications.error.title': {
    ca: "No s'han pogut carregar les notificacions.",
    es: 'No se han podido cargar las notificaciones.',
    en: "Couldn't load notifications.",
  } as Dict,
  'notifications.error.retry': {
    ca: 'Torna-ho a provar',
    es: 'Reintentar',
    en: 'Retry',
  } as Dict,
  'notifications.empty.title': {
    ca: 'Encara no tens notificacions',
    es: 'Aún no tienes notificaciones',
    en: 'No notifications yet',
  } as Dict,
  'notifications.empty.hint': {
    ca: "T'avisarem quan hi hagi noves notícies.",
    es: 'Te avisaremos cuando lleguen nuevas noticias.',
    en: "We'll let you know when there's news.",
  } as Dict,
  'notifications.item.cta': { ca: 'Llegir', es: 'Leer', en: 'Read' } as Dict,
} as const

export type TKey = keyof typeof D

export const t = (key: TKey, lang: Lang): string => {
  const entry = D[key]
  return entry?.[lang] ?? entry?.es ?? String(key)
}
