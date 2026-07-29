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
  'common.close': { ca: 'Tancar', es: 'Cerrar', en: 'Close' } as Dict,
  'common.cancel': { ca: 'Cancel·lar', es: 'Cancelar', en: 'Cancel' } as Dict,

  // ── Redeem balance flow ─────────────────────────────────
  'redeem.title_confirm': {
    ca: 'Confirma el bescanvi',
    es: 'Confirma el canje',
    en: 'Confirm redemption',
  } as Dict,
  'redeem.title_code': {
    ca: 'El teu codi de bescanvi',
    es: 'Tu código de canje',
    en: 'Your redemption code',
  } as Dict,
  'redeem.current_balance': {
    ca: 'Saldo actual',
    es: 'Saldo actual',
    en: 'Current balance',
  } as Dict,
  'redeem.balance_after': {
    ca: 'Saldo després del bescanvi',
    es: 'Saldo después del canje',
    en: 'Balance after redemption',
  } as Dict,
  'redeem.step1': {
    ca: 'Confirma el bescanvi i descomptarem els punts del teu saldo.',
    es: 'Confirma el canje y descontaremos los puntos de tu saldo.',
    en: "Confirm and we'll deduct the points from your balance.",
  } as Dict,
  'redeem.step2': {
    ca: "Rebràs un codi de 5 dígits. Ensenya'l al comerç adherit.",
    es: 'Recibirás un código de 5 dígitos. Muéstralo en el comercio adherido.',
    en: "You'll get a 5-digit code. Show it at the participating shop.",
  } as Dict,
  'redeem.step3': {
    ca: 'El comerç introdueix el codi al seu back‑office i aplica el descompte.',
    es: 'El comercio introduce el código en su back‑office y aplica el descuento.',
    en: 'The shop enters the code in their back‑office and applies the discount.',
  } as Dict,
  'redeem.cta_confirm': {
    ca: 'Bescanviar ara',
    es: 'Canjear ahora',
    en: 'Redeem now',
  } as Dict,
  'redeem.cta_done': { ca: 'Fet', es: 'Hecho', en: 'Done' } as Dict,
  'redeem.code_label': {
    ca: 'Codi de bescanvi',
    es: 'Código de canje',
    en: 'Redemption code',
  } as Dict,
  'redeem.code_hint': {
    ca: 'Vàlid per un únic ús. No comparteixis aquest codi.',
    es: 'Válido para un único uso. No compartas este código.',
    en: 'Single use only. Do not share this code.',
  } as Dict,
  'redeem.copy_code': {
    ca: 'Copiar codi',
    es: 'Copiar código',
    en: 'Copy code',
  } as Dict,
  'redeem.copied': { ca: 'Copiat', es: 'Copiado', en: 'Copied' } as Dict,
  'redeem.status_pending': {
    ca: 'Pendent',
    es: 'Pendiente',
    en: 'Pending',
  } as Dict,
  'redeem.instructions_show': {
    ca: 'Ensenya el codi al personal del comerç quan vulguis aplicar el descompte.',
    es: 'Muestra el código al personal del comercio cuando quieras aplicar el descuento.',
    en: 'Show the code to the shop staff when you want to apply the discount.',
  } as Dict,
  'redeem.instructions_validate': {
    ca: "Quan el comerç l'introdueixi al back‑office, el codi es validarà i quedarà consumit.",
    es: 'Cuando el comercio lo introduzca en el back‑office, el código se validará y quedará consumido.',
    en: 'Once the shop enters it in their back‑office, the code will be validated and consumed.',
  } as Dict,

  // ── Redeem merchandise / experience flow ────────────────
  'redeem_merch.title_confirm': {
    ca: 'Sol·licita el bescanvi',
    es: 'Solicita el canje',
    en: 'Request redemption',
  } as Dict,
  'redeem_merch.title_pending': {
    ca: 'Bescanvi sol·licitat',
    es: 'Canje solicitado',
    en: 'Redemption requested',
  } as Dict,
  'redeem_merch.step1': {
    ca: 'Confirma la sol·licitud i descomptarem els punts del teu saldo.',
    es: 'Confirma la solicitud y descontaremos los puntos de tu saldo.',
    en: "Confirm the request and we'll deduct the points from your balance.",
  } as Dict,
  'redeem_merch.step2': {
    ca: "Rebràs un codi de 5 dígits. Ensenya'l al comerç per recollir el premi.",
    es: 'Recibirás un código de 5 dígitos. Muéstralo en el comercio para recoger el premio.',
    en: "You'll get a 5-digit code. Show it at the shop to pick up the prize.",
  } as Dict,
  'redeem_merch.step3': {
    ca: 'Quan el back‑office confirmi el lliurament, el bescanvi passarà a redimit.',
    es: 'Cuando el back‑office confirme la entrega, el canje pasará a redimido.',
    en: 'Once the back‑office confirms delivery, the redemption is marked redeemed.',
  } as Dict,
  'redeem_merch.cta_request': {
    ca: 'Sol·licitar bescanvi',
    es: 'Solicitar canje',
    en: 'Request redemption',
  } as Dict,
  'redeem_merch.status_pending': {
    ca: 'Pendent de lliurament',
    es: 'Pendiente de entrega',
    en: 'Pending delivery',
  } as Dict,
  'redeem_merch.pending_hint': {
    ca: 'Ensenya aquest codi al comerç per recollir el teu premi. Quedarà com a redimit quan el back‑office ho confirmi.',
    es: 'Muestra este código en el comercio para recoger tu premio. Quedará como redimido cuando el back‑office lo confirme.',
    en: 'Show this code at the shop to pick up your prize. It becomes redeemed once the back‑office confirms.',
  } as Dict,
  'redeem_merch.instructions_pickup': {
    ca: "Acosta't al comerç indicat i ensenya el codi al personal per recollir el premi.",
    es: 'Acércate al comercio indicado y muestra el código al personal para recoger el premio.',
    en: 'Visit the indicated shop and show the code to the staff to pick up your prize.',
  } as Dict,
  'redeem_merch.instructions_confirm': {
    ca: 'Quan el back‑office validi el lliurament, rebràs la confirmació i el bescanvi quedarà redimit.',
    es: 'Cuando el back‑office valide la entrega, recibirás la confirmación y el canje quedará redimido.',
    en: "Once the back‑office validates delivery, you'll get a confirmation and the redemption is marked redeemed.",
  } as Dict,

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
    ca: 'Hem enviat un codi de 6 dígits a',
    es: 'Hemos enviado un código de 6 dígitos a',
    en: 'We sent a 6-digit code to',
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
  'tabs.points': {
    ca: 'Els meus punts',
    es: 'Mis puntos',
    en: 'My points',
  } as Dict,
  'tabs.rewards': {
    ca: 'Premis canjats',
    es: 'Premios canjeados',
    en: 'Redeemed rewards',
  } as Dict,
  'tabs.profile': { ca: 'Perfil', es: 'Perfil', en: 'Profile' } as Dict,

  // ── Points history ───────────────────────────────────────
  'points.title': {
    ca: 'Historial de punts',
    es: 'Historial de puntos',
    en: 'Points history',
  } as Dict,
  'points.placeholder': {
    ca: 'Aquí veuràs els punts guanyats i consumits.',
    es: 'Aquí verás los puntos ganados y consumidos.',
    en: "Here you'll see earned and redeemed points.",
  } as Dict,
  'points.history.title': {
    ca: 'Historial de punts',
    es: 'Historial de puntos',
    en: 'Points history',
  } as Dict,
  'points.history.balance': {
    ca: 'Saldo actual',
    es: 'Saldo actual',
    en: 'Current balance',
  } as Dict,
  'points.history.earned': {
    ca: 'Guanyats',
    es: 'Ganados',
    en: 'Earned',
  } as Dict,
  'points.history.spent': {
    ca: 'Gastats',
    es: 'Gastados',
    en: 'Spent',
  } as Dict,
  'points.history.filter_all': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
  'points.history.filter_earned': {
    ca: 'Guanyats',
    es: 'Ganados',
    en: 'Earned',
  } as Dict,
  'points.history.filter_spent': {
    ca: 'Gastats',
    es: 'Gastados',
    en: 'Spent',
  } as Dict,
  'points.history.empty': {
    ca: 'Encara no tens moviments de punts.',
    es: 'Aún no tienes movimientos de puntos.',
    en: 'You have no points activity yet.',
  } as Dict,
  'points.history.group.today': { ca: 'Avui', es: 'Hoy', en: 'Today' } as Dict,
  'points.history.group.week': {
    ca: 'Aquesta setmana',
    es: 'Esta semana',
    en: 'This week',
  } as Dict,
  'points.history.group.month': {
    ca: 'Aquest mes',
    es: 'Este mes',
    en: 'This month',
  } as Dict,
  'points.history.group.earlier': {
    ca: 'Anteriors',
    es: 'Anteriores',
    en: 'Earlier',
  } as Dict,
  'points.history.type.signup': {
    ca: 'Registre / benvinguda',
    es: 'Registro / bienvenida',
    en: 'Sign-up bonus',
  } as Dict,
  'points.history.type.first_scan': {
    ca: 'Primer escaneig del local',
    es: 'Primer escaneo del local',
    en: 'First scan',
  } as Dict,
  'points.history.type.visit': {
    ca: 'Visita amb QR',
    es: 'Visita con QR',
    en: 'QR visit',
  } as Dict,
  'points.history.type.purchase': {
    ca: 'Compra / reserva / servei',
    es: 'Compra / reserva / servicio',
    en: 'Purchase / booking',
  } as Dict,
  'points.history.type.campaign': {
    ca: 'Campanya especial',
    es: 'Campaña especial',
    en: 'Special campaign',
  } as Dict,
  'points.history.type.redeem': {
    ca: 'Bescanvi per premi',
    es: 'Canje por premio',
    en: 'Reward redeemed',
  } as Dict,

  // ── Merchants (Comerços) screen ──────────────────────────
  'merchants.title': {
    ca: 'Comerços adherits',
    es: 'Comercios adheridos',
    en: 'Member shops',
  } as Dict,
  'merchants.subtitle': {
    ca: '{count} establiments participen al programa',
    es: '{count} establecimientos participan en el programa',
    en: '{count} shops take part in the programme',
  } as Dict,
  'merchants.points_notice': {
    ca: 'Cada comerç et dóna {n} punts en escanejar el seu QR',
    es: 'Cada comercio te da {n} puntos al escanear su QR',
    en: 'Each shop gives you {n} points when you scan its QR',
  } as Dict,
  'merchants.filter_all': {
    ca: 'Totes les categories',
    es: 'Todas las categorías',
    en: 'All categories',
  } as Dict,
  'merchants.filter_by_category': {
    ca: 'Filtra per categoria',
    es: 'Filtra por categoría',
    en: 'Filter by category',
  } as Dict,
  'merchants.results_count': {
    ca: '{count} comerços',
    es: '{count} comercios',
    en: '{count} shops',
  } as Dict,
  'merchants.card.qr': { ca: 'QR', es: 'QR', en: 'QR' } as Dict,
  'merchants.card.points': {
    ca: '+{n} pts',
    es: '+{n} pts',
    en: '+{n} pts',
  } as Dict,
  'merchants.card.member': {
    ca: 'Adherit',
    es: 'Adherido',
    en: 'Member',
  } as Dict,
  'merchants.fab.scan': {
    ca: 'Escaneja QR',
    es: 'Escanea QR',
    en: 'Scan QR',
  } as Dict,
  'merchants.empty.title': {
    ca: 'Cap comerç en aquesta categoria',
    es: 'Ningún comercio en esta categoría',
    en: 'No shops in this category',
  } as Dict,
  'merchants.empty.clear': {
    ca: 'Veure totes les categories',
    es: 'Ver todas las categorías',
    en: 'Show all categories',
  } as Dict,
  'merchants.error.title': {
    ca: "No s'han pogut carregar els comerços",
    es: 'No se han podido cargar los comercios',
    en: "Couldn't load shops",
  } as Dict,
  'merchants.error.retry': {
    ca: 'Tornar a provar',
    es: 'Reintentar',
    en: 'Try again',
  } as Dict,

  // ── Merchant detail (Fitxa del comerç) ──────────────────
  'merchant.back': {
    ca: 'Tornar als comerços',
    es: 'Volver a comercios',
    en: 'Back to shops',
  } as Dict,
  'merchant.badge.visited': {
    ca: '✓ Visitat',
    es: '✓ Visitado',
    en: '✓ Visited',
  } as Dict,
  'merchant.status.active': { ca: 'Actiu', es: 'Activo', en: 'Active' } as Dict,
  'merchant.status.open': {
    ca: 'Obert ara',
    es: 'Abierto ahora',
    en: 'Open now',
  } as Dict,
  'merchant.status.closed': {
    ca: 'Tancat ara',
    es: 'Cerrado ahora',
    en: 'Closed now',
  } as Dict,
  'merchant.status.closes_at': {
    ca: 'tanca a les {h}',
    es: 'cierra a las {h}',
    en: 'closes at {h}',
  } as Dict,
  'merchant.points.earn_title': {
    ca: 'Guanya +{n} punts',
    es: 'Gana +{n} puntos',
    en: 'Earn +{n} points',
  } as Dict,
  'merchant.points.earn_subtitle': {
    ca: 'Escaneja el QR del taulell en visitar-lo',
    es: 'Escanea el QR del mostrador al visitarlo',
    en: 'Scan the QR at the counter when you visit',
  } as Dict,
  'merchant.points.scan_cta': {
    ca: 'Escanejar QR',
    es: 'Escanear QR',
    en: 'Scan QR',
  } as Dict,
  'merchant.points.done_title': {
    ca: '+{n} punts guanyats',
    es: '+{n} puntos ganados',
    en: '+{n} points earned',
  } as Dict,
  'merchant.points.done_subtitle': {
    ca: "Ja has escanejat el QR d'aquest comerç",
    es: 'Ya has escaneado el QR de este comercio',
    en: "You've already scanned this shop's QR",
  } as Dict,
  'merchant.points.done_note': {
    ca: 'Aquest comerç ja és a la teva llista. No es donen més punts per tornar-lo a escanejar.',
    es: 'Este comercio ya está en tu lista. No se dan más puntos por volver a escanearlo.',
    en: 'This shop is already in your list. No extra points for scanning it again.',
  } as Dict,
  'merchant.points.last_scan': {
    ca: 'Última visita: {date}',
    es: 'Última visita: {date}',
    en: 'Last visit: {date}',
  } as Dict,
  'merchant.points.days_left': {
    ca: 'Falten {n} dies per tornar a guanyar punts',
    es: 'Faltan {n} días para volver a ganar puntos',
    en: '{n} days left to earn points again',
  } as Dict,
  'merchant.points.days_left_one': {
    ca: 'Falta 1 dia per tornar a guanyar punts',
    es: 'Falta 1 día para volver a ganar puntos',
    en: '1 day left to earn points again',
  } as Dict,
  'merchant.points.in_list': {
    ca: 'A la teva llista',
    es: 'En tu lista',
    en: 'In your list',
  } as Dict,
  'merchant.cta.visited': {
    ca: 'Ja escanejat · a la teva llista',
    es: 'Ya escaneado · en tu lista',
    en: 'Already scanned · in your list',
  } as Dict,
  'merchant.info.title': {
    ca: 'Informació',
    es: 'Información',
    en: 'Information',
  } as Dict,
  'merchant.info.address': {
    ca: 'Adreça',
    es: 'Dirección',
    en: 'Address',
  } as Dict,
  'merchant.info.schedule': {
    ca: "Horari d'avui",
    es: 'Horario de hoy',
    en: "Today's schedule",
  } as Dict,
  'merchant.info.phone': { ca: 'Telèfon', es: 'Teléfono', en: 'Phone' } as Dict,
  'merchant.info.web': { ca: 'Web', es: 'Web', en: 'Website' } as Dict,
  'merchant.info.call': { ca: 'Trucar', es: 'Llamar', en: 'Call' } as Dict,
  'merchant.info.open_web': { ca: 'Obrir', es: 'Abrir', en: 'Open' } as Dict,
  'merchant.map.title': {
    ca: 'Ubicació',
    es: 'Ubicación',
    en: 'Location',
  } as Dict,
  'merchant.map.open': {
    ca: 'Obrir al mapa',
    es: 'Abrir en el mapa',
    en: 'Open in map',
  } as Dict,
  'merchant.promos.title': {
    ca: 'Promocions del comerç',
    es: 'Promociones del comercio',
    en: 'Shop promotions',
  } as Dict,
  'merchant.promos.see_all': {
    ca: 'Veure totes les promocions',
    es: 'Ver todas las promociones',
    en: 'See all promotions',
  } as Dict,
  'merchant.promos.info_only': {
    ca: 'Informatives',
    es: 'Informativas',
    en: 'Info only',
  } as Dict,
  'merchant.description.title': {
    ca: 'Descripció',
    es: 'Descripción',
    en: 'Description',
  } as Dict,
  'merchant.cta.scan_earn': {
    ca: 'Escanejar QR i guanyar +{n}',
    es: 'Escanear QR y ganar +{n}',
    en: 'Scan QR and earn +{n}',
  } as Dict,
  'merchant.cta.see_promos': {
    ca: 'Veure les promocions del comerç',
    es: 'Ver las promociones del comercio',
    en: 'See shop promotions',
  } as Dict,
  'merchant.error.title': {
    ca: "No s'ha pogut carregar el comerç",
    es: 'No se ha podido cargar el comercio',
    en: "Couldn't load the shop",
  } as Dict,
  'merchant.error.retry': {
    ca: 'Tornar a provar',
    es: 'Reintentar',
    en: 'Try again',
  } as Dict,
  'merchant.notfound.title': {
    ca: 'No hem trobat aquest comerç',
    es: 'No hemos encontrado este comercio',
    en: 'Shop not found',
  } as Dict,
  'merchant.notfound.back': {
    ca: 'Tornar al llistat',
    es: 'Volver al listado',
    en: 'Back to list',
  } as Dict,

  // ── Module labels ────────────────────────────────────────
  'module.agenda': { ca: 'Agenda', es: 'Agenda', en: 'Agenda' } as Dict,
  'module.chat': { ca: 'KM0 CHAT', es: 'KM0 CHAT', en: 'KM0 CHAT' } as Dict,
  'module.ajuntament': {
    ca: 'Ajuntament',
    es: 'Ayuntamiento',
    en: 'Town hall',
  } as Dict,
  'module.comerc': {
    ca: 'Comerços i serveis',
    es: 'Comercios y servicios',
    en: 'Shops & services',
  } as Dict,
  'module.punts': { ca: 'Punts', es: 'Puntos', en: 'Points' } as Dict,
  'module.cupons': { ca: 'Cupons', es: 'Cupones', en: 'Coupons' } as Dict,
  'module.noticias': { ca: 'Notícies', es: 'Noticias', en: 'News' } as Dict,
  'module.servicios': {
    ca: 'Serveis',
    es: 'Servicios',
    en: 'Services',
  } as Dict,
  'module.premis': {
    ca: 'Premis i promos',
    es: 'Premios y promos',
    en: 'Rewards & promos',
  } as Dict,
  'module.coming_soon': {
    ca: 'Pròximament',
    es: 'Próximamente',
    en: 'Coming soon',
  } as Dict,
  'module.register_to_enable': {
    ca: "Registra't per activar",
    es: 'Regístrate para activar',
    en: 'Sign up to enable',
  } as Dict,

  // ── Rewards catalog ──────────────────────────────────────
  'rewards.title': {
    ca: 'Tots els premis',
    es: 'Todos los premios',
    en: 'All rewards',
  } as Dict,
  'rewards.subtitle': {
    ca: 'Catàleg de recompenses que pots bescanviar amb els teus punts.',
    es: 'Catálogo de recompensas que puedes canjear con tus puntos.',
    en: 'Catalog of rewards you can redeem with your points.',
  } as Dict,
  'rewards.balance_label': {
    ca: 'Tens {n} punts',
    es: 'Tienes {n} puntos',
    en: 'You have {n} points',
  } as Dict,
  'rewards.guest_label': {
    ca: "Registra't per començar a acumular punts.",
    es: 'Regístrate para empezar a acumular puntos.',
    en: 'Sign up to start earning points.',
  } as Dict,
  'rewards.category.balance': {
    ca: 'Saldo',
    es: 'Saldo',
    en: 'Balance',
  } as Dict,
  'rewards.category.experience': {
    ca: 'Experiència',
    es: 'Experiencia',
    en: 'Experience',
  } as Dict,
  'rewards.category.merchandising': {
    ca: 'Merchandising',
    es: 'Merchandising',
    en: 'Merchandising',
  } as Dict,
  'rewards.category.discount': {
    ca: 'Descompte',
    es: 'Descuento',
    en: 'Discount',
  } as Dict,
  'rewards.filter_all': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
  'rewards.status.active': {
    ca: 'Disponible',
    es: 'Disponible',
    en: 'Available',
  } as Dict,
  'rewards.status.sold_out': {
    ca: 'Esgotat',
    es: 'Agotado',
    en: 'Sold out',
  } as Dict,
  'rewards.status.inactive': {
    ca: 'No disponible',
    es: 'No disponible',
    en: 'Unavailable',
  } as Dict,
  'rewards.status.can_redeem': {
    ca: 'Pots bescanviar',
    es: 'Puedes canjear',
    en: 'You can redeem',
  } as Dict,
  'rewards.status.missing_points': {
    ca: 'Et falten {n} punts',
    es: 'Te faltan {n} puntos',
    en: '{n} points short',
  } as Dict,
  'rewards.value': { ca: 'Valor', es: 'Valor', en: 'Value' } as Dict,
  'rewards.stock': { ca: 'Estoc', es: 'Stock', en: 'Stock' } as Dict,
  'rewards.stock_unlimited': {
    ca: 'Estoc il·limitat',
    es: 'Stock ilimitado',
    en: 'Unlimited stock',
  } as Dict,
  'rewards.stock_units': {
    ca: '{n} unitats',
    es: '{n} unidades',
    en: '{n} units',
  } as Dict,
  'rewards.cta.redeem': {
    ca: 'Bescanviar',
    es: 'Canjear',
    en: 'Redeem',
  } as Dict,
  'rewards.cta.locked_points': {
    ca: 'Et falten {n} punts',
    es: 'Te faltan {n} puntos',
    en: '{n} points short',
  } as Dict,
  'rewards.cta.locked_guest': {
    ca: "Registra't per bescanviar",
    es: 'Regístrate para canjear',
    en: 'Sign up to redeem',
  } as Dict,
  'rewards.cta.sold_out': {
    ca: 'Esgotat',
    es: 'Agotado',
    en: 'Sold out',
  } as Dict,
  'rewards.cta.inactive': {
    ca: 'No disponible',
    es: 'No disponible',
    en: 'Unavailable',
  } as Dict,
  'rewards.cost': { ca: '{n} pts', es: '{n} pts', en: '{n} pts' } as Dict,
  'rewards.empty': {
    ca: 'Encara no hi ha premis en aquesta categoria.',
    es: 'Aún no hay premios en esta categoría.',
    en: 'No rewards in this category yet.',
  } as Dict,
  'rewards.tab.rewards': { ca: 'Premis', es: 'Premios', en: 'Rewards' } as Dict,
  'rewards.tab.promos': {
    ca: 'Promocions',
    es: 'Promociones',
    en: 'Promos',
  } as Dict,
  'rewards.promos.at': {
    ca: 'A {shop}',
    es: 'En {shop}',
    en: 'At {shop}',
  } as Dict,
  'rewards.promos.empty': {
    ca: 'Encara no hi ha promocions publicades.',
    es: 'Aún no hay promociones publicadas.',
    en: 'No promotions published yet.',
  } as Dict,
  'rewards.promos.info': {
    ca: 'Ofertes dels comerços adherits. No es bescanvien amb punts.',
    es: 'Ofertas de los comercios adheridos. No se canjean con puntos.',
    en: 'Offers from partner shops. Not redeemable with points.',
  } as Dict,

  // ── My redemptions ───────────────────────────────────────
  'redemptions.title': {
    ca: 'Els meus bescanvis',
    es: 'Mis canjes',
    en: 'My redemptions',
  } as Dict,
  'redemptions.summary': {
    ca: 'Bescanvis realitzats',
    es: 'Canjes realizados',
    en: 'Redemptions made',
  } as Dict,
  'redemptions.reward_one': { ca: 'premi', es: 'premio', en: 'reward' } as Dict,
  'redemptions.reward_many': {
    ca: 'premis',
    es: 'premios',
    en: 'rewards',
  } as Dict,
  'redemptions.active_one': {
    ca: 'Tens 1 premi pendent o llest per recollir.',
    es: 'Tienes 1 premio pendiente o listo para recoger.',
    en: 'You have 1 reward pending or ready for pickup.',
  } as Dict,
  'redemptions.active_many': {
    ca: 'Tens {n} premis pendents o llestos per recollir.',
    es: 'Tienes {n} premios pendientes o listos para recoger.',
    en: 'You have {n} rewards pending or ready for pickup.',
  } as Dict,
  'redemptions.filter.all': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
  'redemptions.filter.pending': {
    ca: 'Pendent',
    es: 'Pendiente',
    en: 'Pending',
  } as Dict,
  'redemptions.filter.ready': { ca: 'Llest', es: 'Listo', en: 'Ready' } as Dict,
  'redemptions.filter.redeemed': {
    ca: 'Redimit',
    es: 'Canjeado',
    en: 'Redeemed',
  } as Dict,
  'redemptions.filter.expired': {
    ca: 'Caducat',
    es: 'Caducado',
    en: 'Expired',
  } as Dict,
  'redemptions.status.pending': {
    ca: 'Pendent de lliurament',
    es: 'Pendiente de entrega',
    en: 'Pending delivery',
  } as Dict,
  'redemptions.status.ready': {
    ca: 'Llest per recollir',
    es: 'Listo para recoger',
    en: 'Ready for pickup',
  } as Dict,
  'redemptions.status.redeemed': {
    ca: 'Redimit',
    es: 'Canjeado',
    en: 'Redeemed',
  } as Dict,
  'redemptions.status.expired': {
    ca: 'Caducat',
    es: 'Caducado',
    en: 'Expired',
  } as Dict,
  'redemptions.date': {
    ca: 'Data de bescanvi',
    es: 'Fecha de canje',
    en: 'Redemption date',
  } as Dict,
  'redemptions.value': { ca: 'Valor', es: 'Valor', en: 'Value' } as Dict,
  'redemptions.shop': {
    ca: 'Comerç / punt de recollida',
    es: 'Comercio / punto de recogida',
    en: 'Shop / pickup point',
  } as Dict,
  'redemptions.code': {
    ca: 'Codi de bescanvi',
    es: 'Código de canje',
    en: 'Redemption code',
  } as Dict,
  'redemptions.expires': {
    ca: 'Vàlid fins al {date}',
    es: 'Válido hasta el {date}',
    en: 'Valid until {date}',
  } as Dict,
  'redemptions.expired_on': {
    ca: 'Va caducar el {date}',
    es: 'Caducó el {date}',
    en: 'Expired on {date}',
  } as Dict,
  'redemptions.completed': {
    ca: 'Validat el {date}',
    es: 'Validado el {date}',
    en: 'Validated on {date}',
  } as Dict,
  'redemptions.see_list': {
    ca: 'Veure els meus bescanvis',
    es: 'Ver mis canjes',
    en: 'See my redemptions',
  } as Dict,
  'redemptions.empty': {
    ca: 'Encara no tens bescanvis registrats.',
    es: 'Aún no tienes canjes registrados.',
    en: 'You have no registered redemptions yet.',
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
  'profile.phone': { ca: 'Telèfon', es: 'Teléfono', en: 'Phone' } as Dict,
  'profile.phone_ph': {
    ca: '+34 600 000 000',
    es: '+34 600 000 000',
    en: '+34 600 000 000',
  } as Dict,
  'profile.birth_date': {
    ca: 'Data de naixement',
    es: 'Fecha de nacimiento',
    en: 'Birth date',
  } as Dict,
  'profile.birth_date_hint': {
    ca: 'Si configures la data, et donarem punts el dia del teu aniversari',
    es: 'Si configuras la fecha, te daremos puntos el día de tu cumpleaños',
    en: "If you set your birth date, you'll get points on your birthday",
  } as Dict,

  'profile.error_phone': {
    ca: 'Telèfon no vàlid',
    es: 'Teléfono no válido',
    en: 'Invalid phone number',
  } as Dict,
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

  // ── Scanner (Escàner de QR global) ───────────────────────
  'scanner.close': { ca: 'Tancar', es: 'Cerrar', en: 'Close' } as Dict,
  'scanner.flash': { ca: 'Flaix', es: 'Flash', en: 'Flash' } as Dict,
  'scanner.title': {
    ca: 'Escàner QR',
    es: 'Escáner QR',
    en: 'QR Scanner',
  } as Dict,
  'scanner.hint': {
    ca: 'Enfoca el codi QR del taulell dins del marc',
    es: 'Enfoca el código QR del mostrador dentro del marco',
    en: "Point the counter's QR code inside the frame",
  } as Dict,
  'scanner.footer': {
    ca: 'Cada comerç té el seu QR únic',
    es: 'Cada comercio tiene su QR único',
    en: 'Each shop has its own unique QR',
  } as Dict,
  'scanner.debug.title': {
    ca: 'Simulació (només preview)',
    es: 'Simulación (solo preview)',
    en: 'Simulation (preview only)',
  } as Dict,
  'scanner.debug.ok': { ca: 'Èxit', es: 'Éxito', en: 'Success' } as Dict,
  'scanner.debug.ja_visitat': {
    ca: 'Ja visitat',
    es: 'Ya visitado',
    en: 'Already visited',
  } as Dict,
  'scanner.debug.codi_no_valid': {
    ca: 'Codi no vàlid',
    es: 'Código no válido',
    en: 'Invalid code',
  } as Dict,
  'scanner.debug.qr_caducat': {
    ca: 'QR caducat',
    es: 'QR caducado',
    en: 'Expired QR',
  } as Dict,
  'scanner.debug.sense_connexio': {
    ca: 'Sense connexió',
    es: 'Sin conexión',
    en: 'Offline',
  } as Dict,

  'scanner.validating.title': {
    ca: 'Validant codi…',
    es: 'Validando código…',
    en: 'Validating code…',
  } as Dict,
  'scanner.validating.subtitle': {
    ca: 'Comprovant el comerç i assignant els teus punts',
    es: 'Comprobando el comercio y asignando tus puntos',
    en: 'Checking the shop and assigning your points',
  } as Dict,

  'scanner.error.retry': {
    ca: 'Tornar a escanejar',
    es: 'Volver a escanear',
    en: 'Scan again',
  } as Dict,
  'scanner.error.ja_visitat.title': {
    ca: 'Ja has visitat aquest comerç',
    es: 'Ya has visitado este comercio',
    en: "You've already visited this shop",
  } as Dict,
  'scanner.error.ja_visitat.subtitle': {
    ca: 'Els punts de {nom} ja són teus. Tornaran a estar actius el {data}. Mentrestant pots consultar les seves promocions!',
    es: 'Los puntos de {nom} ya son tuyos. Volverán a estar activos el {data}. Mientras tanto puedes consultar sus promociones!',
    en: "You already earned {nom}'s points. They unlock again on {data}. Meanwhile you can still check its promotions!",
  } as Dict,
  'scanner.error.ja_visitat.cta_promos': {
    ca: 'Veure les promocions del comerç',
    es: 'Ver las promociones del comercio',
    en: "See the shop's promotions",
  } as Dict,
  'scanner.error.ja_visitat.cta_next': {
    ca: 'Escanejar un altre comerç',
    es: 'Escanear otro comercio',
    en: 'Scan another shop',
  } as Dict,
  'scanner.error.codi_no_valid.title': {
    ca: 'Codi no vàlid',
    es: 'Código no válido',
    en: 'Invalid code',
  } as Dict,
  'scanner.error.codi_no_valid.subtitle': {
    ca: "Aquest QR sembla d'una altra app. Assegura't d'escanejar el QR oficial de KM0 LAB del taulell del comerç.",
    es: 'Este QR parece de otra app. Asegúrate de escanear el QR oficial de KM0 LAB del mostrador del comercio.',
    en: "This QR looks like it's from another app. Make sure to scan the official KM0 LAB QR at the counter.",
  } as Dict,
  'scanner.error.qr_caducat.title': {
    ca: 'Aquest QR ha caducat',
    es: 'Este QR ha caducado',
    en: 'This QR has expired',
  } as Dict,
  'scanner.error.qr_caducat.subtitle': {
    ca: 'El comerç ja no forma part del programa. Prova amb un altre comerç adherit.',
    es: 'El comercio ya no forma parte del programa. Prueba con otro comercio adherido.',
    en: 'This shop is no longer part of the programme. Try another partner shop.',
  } as Dict,
  'scanner.error.sense_connexio.title': {
    ca: 'Sense connexió',
    es: 'Sin conexión',
    en: 'No connection',
  } as Dict,
  'scanner.error.sense_connexio.subtitle': {
    ca: 'No hem pogut validar el codi. Comprova la connexió i torna-ho a provar.',
    es: 'No hemos podido validar el código. Comprueba la conexión y vuelve a intentarlo.',
    en: "We couldn't validate the code. Check your connection and try again.",
  } as Dict,

  'scanner.success.title': {
    ca: 'Molt bé, {nom}! 🎉',
    es: '¡Muy bien, {nom}! 🎉',
    en: 'Well done, {nom}! 🎉',
  } as Dict,
  'scanner.success.subtitle': {
    ca: 'Has visitat {comerc}',
    es: 'Has visitado {comerc}',
    en: 'You visited {comerc}',
  } as Dict,
  'scanner.success.points': {
    ca: '+{n} pts',
    es: '+{n} pts',
    en: '+{n} pts',
  } as Dict,
  'scanner.success.total': {
    ca: 'Total: {n} punts',
    es: 'Total: {n} puntos',
    en: 'Total: {n} points',
  } as Dict,

  'scanner.confirmation.title': {
    ca: 'Confirmació de punts',
    es: 'Confirmación de puntos',
    en: 'Points confirmation',
  } as Dict,
  'scanner.confirmation.placeholder': {
    ca: "Aquesta pantalla es construeix a l'apartat 5.",
    es: 'Esta pantalla se construye en el apartado 5.',
    en: 'This screen is built in section 5.',
  } as Dict,
  'scanner.confirmation.back': {
    ca: "Tornar a l'inici",
    es: 'Volver al inicio',
    en: 'Back home',
  } as Dict,
  // Shop categories (API returns slugs; keys must match shop_categories.slug)
  'shopCategories.bakery': {
    ca: 'Fleca',
    es: 'Panadería',
    en: 'Bakery',
  } as Dict,
  'shopCategories.food': {
    ca: 'Alimentació',
    es: 'Alimentación',
    en: 'Food',
  } as Dict,
  'shopCategories.cafe': { ca: 'Cafè', es: 'Café', en: 'Café' } as Dict,
  'shopCategories.restaurant': {
    ca: 'Restaurant',
    es: 'Restaurante',
    en: 'Restaurant',
  } as Dict,
  'shopCategories.bar': { ca: 'Bar', es: 'Bar', en: 'Bar' } as Dict,
  'shopCategories.butcher': {
    ca: 'Carnisseria',
    es: 'Carnicería',
    en: 'Butcher',
  } as Dict,
  'shopCategories.greengrocer': {
    ca: 'Fruiteria',
    es: 'Frutería',
    en: 'Greengrocer',
  } as Dict,
  'shopCategories.fishmonger': {
    ca: 'Peixateria',
    es: 'Pescadería',
    en: 'Fishmonger',
  } as Dict,
  'shopCategories.pharmacy': {
    ca: 'Farmàcia',
    es: 'Farmacia',
    en: 'Pharmacy',
  } as Dict,
  'shopCategories.bookstore': {
    ca: 'Llibreria',
    es: 'Librería',
    en: 'Bookstore',
  } as Dict,
  'shopCategories.clothing': {
    ca: 'Roba',
    es: 'Ropa',
    en: 'Clothing',
  } as Dict,
  'shopCategories.hairdresser': {
    ca: 'Perruqueria',
    es: 'Peluquería',
    en: 'Hairdresser',
  } as Dict,
  'shopCategories.services': {
    ca: 'Serveis',
    es: 'Servicios',
    en: 'Services',
  } as Dict,
  'shopCategories.other': { ca: 'Altres', es: 'Otros', en: 'Other' } as Dict,
} as const

export type TKey = keyof typeof D

export const t = (key: TKey, lang: Lang): string => {
  const entry = D[key]
  return entry?.[lang] ?? entry?.es ?? String(key)
}
