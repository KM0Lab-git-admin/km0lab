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
  'language.image_alt': {
    ca: "Plaça d'un municipi mediterrani plena de vida",
    es: 'Plaza de un municipio mediterráneo llena de vida',
    en: 'A lively Mediterranean town square',
  } as Dict,
  'language.catalan': { ca: 'Català', es: 'Català', en: 'Català' } as Dict,
  'language.catalan_description': {
    ca: 'Comença en català',
    es: 'Comença en català',
    en: 'Comença en català',
  } as Dict,
  'language.spanish': { ca: 'Español', es: 'Español', en: 'Español' } as Dict,
  'language.spanish_description': {
    ca: 'Empieza en español',
    es: 'Empieza en español',
    en: 'Empieza en español',
  } as Dict,
  'language.english': { ca: 'English', es: 'English', en: 'English' } as Dict,
  'language.english_description': {
    ca: 'Start in English',
    es: 'Start in English',
    en: 'Start in English',
  } as Dict,

  // ── Onboarding ───────────────────────────────────────────
  'onboarding.skip': { ca: 'SALTAR', es: 'SALTAR', en: 'SKIP' } as Dict,
  'onboarding.finish': { ca: 'INICI', es: 'INICIO', en: 'START' } as Dict,

  // ── How it works (carrusel de 5 pasos) ───────────────────
  'how_it_works.subtitle': {
    ca: 'Participa, suma punts i gaudeix de avantatges a prop teu.',
    es: 'Participa, suma puntos y disfruta de ventajas cerca de ti.',
    en: 'Take part, earn points and enjoy perks near you.',
  } as Dict,
  'how_it_works.badge': { ca: 'PAS', es: 'PASO', en: 'STEP' } as Dict,
  'how_it_works.skip': { ca: 'SALTAR', es: 'SALTAR', en: 'SKIP' } as Dict,
  'how_it_works.finish': {
    ca: 'CREA EL TEU COMPTE',
    es: 'CREA TU CUENTA',
    en: 'CREATE YOUR ACCOUNT',
  } as Dict,
  'how_it_works.step1.title': {
    ca: "Registra't",
    es: 'Regístrate',
    en: 'Sign up',
  } as Dict,
  'how_it_works.step1.desc': {
    ca: 'Crea el teu compte a KM0 Lab i comença a formar part de la teva comunitat.',
    es: 'Crea tu cuenta en KM0 Lab y empieza a formar parte de tu comunidad.',
    en: 'Create your KM0 Lab account and start being part of your community.',
  } as Dict,
  'how_it_works.step2.title': {
    ca: 'Visita comerços adherits',
    es: 'Visita comercios adheridos',
    en: 'Visit participating shops',
  } as Dict,
  'how_it_works.step2.desc': {
    ca: "Descobreix els comerços i serveis que formen part de KM0 Lab i visita'ls.",
    es: 'Descubre los comercios y servicios que forman parte de KM0 Lab y visítalos.',
    en: 'Discover the shops and services that are part of KM0 Lab and visit them.',
  } as Dict,
  'how_it_works.step3.title': {
    ca: 'Escaneja i suma punts',
    es: 'Escanea y suma puntos',
    en: 'Scan and earn points',
  } as Dict,
  'how_it_works.step3.desc': {
    ca: "Busca el codi QR de l'establiment, escaneja'l des de l'app i aconsegueix punts per la teva visita.",
    es: 'Busca el código QR del establecimiento, escanéalo desde la app y consigue puntos por tu visita.',
    en: "Find the venue's QR code, scan it from the app and earn points for your visit.",
  } as Dict,
  'how_it_works.step4.title': {
    ca: 'Segueix sumant',
    es: 'Sigue sumando',
    en: 'Keep earning',
  } as Dict,
  'how_it_works.step4.desc': {
    ca: 'Aconsegueix més punts participant en esdeveniments, respondent enquestes, completant accions o celebrant moments especials com el teu aniversari.',
    es: 'Consigue más puntos participando en eventos, respondiendo encuestas, completando acciones o celebrando momentos especiales como tu cumpleaños.',
    en: 'Earn more points by taking part in events, answering surveys, completing actions or celebrating special moments like your birthday.',
  } as Dict,
  'how_it_works.step5.title': {
    ca: 'Gaudeix dels teus punts',
    es: 'Disfruta tus puntos',
    en: 'Enjoy your points',
  } as Dict,
  'how_it_works.step5.desc': {
    ca: 'Bescanvia els teus punts per productes, experiències, promocions o vals descompte en comerços locals. Els teus punts, tu tries.',
    es: 'Canjea tus puntos por productos, experiencias, promociones o vales descuento en comercios locales. Tus puntos, tú eliges.',
    en: 'Redeem your points for products, experiences, promotions or discount vouchers in local shops. Your points, your choice.',
  } as Dict,

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
  'postal.image_alt': {
    ca: "Maqueta isomètrica d'una plaça mediterrània amb font, comerços i ajuntament",
    es: 'Maqueta isométrica de una plaza mediterránea con fuente, comercios y ayuntamiento',
    en: 'Isometric model of a Mediterranean square with a fountain, shops and town hall',
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

  // ── Email OTP (plantilla de correo) ──────────────────────
  'email_otp.title': {
    ca: "El teu codi d'accés",
    es: 'Tu código de acceso',
    en: 'Your access code',
  } as Dict,
  'email_otp.intro': {
    ca: 'Fes servir aquest codi per entrar a KM0 LAB o recuperar la teva sessió.',
    es: 'Usa este código para entrar en KM0 LAB o recuperar tu sesión.',
    en: 'Use this code to sign in to KM0 LAB or recover your session.',
  } as Dict,
  'email_otp.code_label': {
    ca: 'Codi de 6 dígits',
    es: 'Código de 6 dígitos',
    en: '6-digit code',
  } as Dict,
  'email_otp.validity': {
    ca: 'Vàlid durant {minutes} minuts',
    es: 'Válido durante {minutes} minutos',
    en: 'Valid for {minutes} minutes',
  } as Dict,
  'email_otp.security': {
    ca: 'Si no has demanat aquest codi, ignora aquest correu. No el comparteixis amb ningú.',
    es: 'Si no has pedido este código, ignora este correo. No lo compartas con nadie.',
    en: "If you didn't request this code, ignore this email. Never share it.",
  } as Dict,
  'email_otp.footer_hint': {
    ca: "No el trobes a la safata d'entrada? Mira a spam o promocions.",
    es: '¿No lo encuentras en la bandeja de entrada? Mira en spam o promociones.',
    en: "Can't find it in your inbox? Check spam or promotions.",
  } as Dict,
  'email_otp.footer_signature': {
    ca: 'KM0 LAB · Comerç local de proximitat',
    es: 'KM0 LAB · Comercio local de proximidad',
    en: 'KM0 LAB · Local neighbourhood commerce',
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
  'otp.demo_hint': {
    ca: "Prototip: encara no s'envien correus. Fes servir el codi 123456.",
    es: 'Prototipo: aún no se envían correos. Usa el código 123456.',
    en: "Prototype: emails aren't sent yet. Use the code 123456.",
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
    es: 'Verlos todos',
    en: 'See all',
  } as Dict,
  'home.action.see_all_f': {
    ca: 'Veure-les totes',
    es: 'Verlas todas',
    en: 'See all',
  } as Dict,
  'home.login_cta': {
    ca: 'Iniciar sessió',
    es: 'Iniciar sesión',
    en: 'Sign in',
  } as Dict,
  'home.section.rewards': {
    ca: 'Premis',
    es: 'Premios',
    en: 'Rewards',
  } as Dict,
  'home.section.promos': {
    ca: 'Promocions dels comerços',
    es: 'Promociones de los comercios',
    en: 'Merchant promos',
  } as Dict,
  'home.locked.badge': {
    ca: "Registra't",
    es: 'Regístrate',
    en: 'Sign up',
  } as Dict,
  'home.locked.cta': {
    ca: "Registra't per desbloquejar",
    es: 'Regístrate para desbloquear',
    en: 'Sign up to unlock',
  } as Dict,
  'home.members.teaser': {
    ca: "Registra't i podràs guanyar punts, bescanjar premis i gaudir de promocions.",
    es: 'Regístrate y podrás ganar puntos, canjear premios y disfrutar de promociones.',
    en: 'Sign up to earn points, redeem rewards and enjoy promotions.',
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
    ca: "Registra't i comença a guanyar",
    es: 'Regístrate y empieza a ganar',
    en: 'Sign up and start earning',
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
  'home.join.how_it_works': {
    ca: 'Com funciona?',
    es: '¿Cómo funciona?',
    en: 'How does it work?',
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
  'tabs.actions': { ca: 'Accions', es: 'Acciones', en: 'Actions' } as Dict,

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
    ca: "Primer registre a l'app",
    es: 'Primer registro en la app',
    en: 'App sign-up',
  } as Dict,
  'points.history.type.first_scan': {
    ca: "Primer escaneig d'un comerç",
    es: 'Primer escaneo de un comercio',
    en: 'First shop scan',
  } as Dict,
  'points.history.type.scan': {
    ca: "Escaneig d'un comerç",
    es: 'Escaneo de un comercio',
    en: 'Shop scan',
  } as Dict,
  'points.history.type.web_visit': {
    ca: 'Visita web',
    es: 'Visita web',
    en: 'Web visit',
  } as Dict,
  'points.history.type.event_signup': {
    ca: 'Inscripció a esdeveniment',
    es: 'Inscripción a evento',
    en: 'Event sign-up',
  } as Dict,
  'points.history.type.survey': {
    ca: 'Enquesta de satisfacció',
    es: 'Encuesta de satisfacción',
    en: 'Satisfaction survey',
  } as Dict,
  'points.history.type.suggestion': {
    ca: 'Suggeriment enviat',
    es: 'Sugerencia enviada',
    en: 'Suggestion sent',
  } as Dict,
  'points.history.type.redeem': {
    ca: 'Bescanvi per premi',
    es: 'Canje por premio',
    en: 'Reward redeemed',
  } as Dict,

  // ── Points actions catalog ───────────────────────────────
  'points.actions.title': {
    ca: 'Accions per guanyar punts',
    es: 'Acciones para ganar puntos',
    en: 'Actions to earn points',
  } as Dict,
  'points.actions.subtitle': {
    ca: 'Descobreix com guanyar punts i quines ja has completat.',
    es: 'Descubre cómo ganar puntos y cuáles ya has completado.',
    en: "Discover how to earn points and which you've already completed.",
  } as Dict,
  'points.actions.completed': {
    ca: 'Completada',
    es: 'Completada',
    en: 'Completed',
  } as Dict,
  'points.actions.pending': {
    ca: 'Pendent',
    es: 'Pendiente',
    en: 'Pending',
  } as Dict,
  'points.actions.empty': {
    ca: 'No hi ha accions disponibles.',
    es: 'No hay acciones disponibles.',
    en: 'No actions available.',
  } as Dict,

  'points.actions.type.birthday': {
    ca: 'Aniversari',
    es: 'Aniversario',
    en: 'Birthday',
  } as Dict,
  'points.actions.type.signup': {
    ca: "Registre en l'app",
    es: 'Registro en la app',
    en: 'App sign-up',
  } as Dict,
  'points.actions.type.first_scan': {
    ca: "Primer escaneig d'un comerç",
    es: 'Primer escaneo de un comercio',
    en: 'First shop scan',
  } as Dict,
  'points.actions.type.scan': {
    ca: "Escaneig d'un comerç",
    es: 'Escaneo de un comercio',
    en: 'Shop scan',
  } as Dict,
  'points.actions.type.web_visit': {
    ca: 'Visita web',
    es: 'Visita web',
    en: 'Web visit',
  } as Dict,
  'points.actions.type.newsletter': {
    ca: 'Registre web',
    es: 'Registro web',
    en: 'Web sign-up',
  } as Dict,
  'points.actions.type.event_signup': {
    ca: 'Inscripció a esdeveniment',
    es: 'Inscripción a evento',
    en: 'Event sign-up',
  } as Dict,
  'points.actions.type.survey': {
    ca: 'Enquesta',
    es: 'Encuesta',
    en: 'Survey',
  } as Dict,

  'points.actions.birthday.title': {
    ca: 'Perquè avui és el teu aniversari!',
    es: '¡Porque hoy es tu aniversario!',
    en: "Because it's your birthday!",
  } as Dict,
  'points.actions.birthday.description': {
    ca: 'Perquè avui és el teu aniversari!',
    es: '¡Porque hoy es tu aniversario!',
    en: "Because it's your birthday!",
  } as Dict,
  'points.actions.signup.title': {
    ca: "Primer registre a l'app",
    es: 'Primer registro en la app',
    en: 'App sign-up',
  } as Dict,
  'points.actions.signup.description': {
    ca: "Els veïns reben un impuls inicial en donar-se d'alta.",
    es: 'Los vecinos reciben un impulso inicial al darse de alta.',
    en: 'Neighbours get an initial boost when signing up.',
  } as Dict,
  'points.actions.first_scan.title': {
    ca: "Primer escaneig d'un comerç",
    es: 'Primer escaneo de un comercio',
    en: 'First shop scan',
  } as Dict,
  'points.actions.first_scan.description': {
    ca: "Bonificació única la primera vegada que el veí escaneja el QR d'un comerç KM0 LAB.",
    es: 'Bonificación única la primera vez que el vecino escanea el QR de un comercio KM0 LAB.',
    en: 'One-time bonus the first time a neighbour scans a KM0 LAB shop QR.',
  } as Dict,
  'points.actions.scan.title': {
    ca: "Escaneig d'un comerç",
    es: 'Escaneo de un comercio',
    en: 'Shop scan',
  } as Dict,
  'points.actions.scan.description': {
    ca: "Bonificació la primera vegada que s'escaneja un QR de comerç.",
    es: 'Bonificación la primera vez que se escanea un QR de comercio.',
    en: 'Bonus the first time a shop QR is scanned.',
  } as Dict,
  'points.actions.web_visit.title': {
    ca: 'Visita la web de turisme',
    es: 'Visita la web de turismo',
    en: 'Visit the tourism website',
  } as Dict,
  'points.actions.web_visit.description': {
    ca: "Descobreix els punts d'interès de Malgrat.",
    es: 'Descubre los puntos de interés de Malgrat.',
    en: "Discover Malgrat's points of interest.",
  } as Dict,
  'points.actions.newsletter.title': {
    ca: 'Registre al butlletí municipal',
    es: 'Registro al boletín municipal',
    en: 'Sign up to the municipal newsletter',
  } as Dict,
  'points.actions.newsletter.description': {
    ca: 'Rep les novetats del teu ajuntament al correu.',
    es: 'Recibe las novedades de tu ayuntamiento en el correo.',
    en: 'Get the latest news from your town hall by email.',
  } as Dict,
  'points.actions.event_signup.title': {
    ca: 'Inscripció a la Festa Major',
    es: 'Inscripción a la Festa Major',
    en: 'Sign up for the Festa Major',
  } as Dict,
  'points.actions.event_signup.description': {
    ca: 'Inscriu-te a les activitats oficials de la Festa Major.',
    es: 'Inscríbete a las actividades oficiales de la Festa Major.',
    en: 'Sign up for official Festa Major activities.',
  } as Dict,
  'points.actions.survey.title': {
    ca: 'Enquesta de satisfacció',
    es: 'Encuesta de satisfacción',
    en: 'Satisfaction survey',
  } as Dict,
  'points.actions.survey.description': {
    ca: 'Respon una enquesta breu sobre el programa KM0 LAB.',
    es: 'Responde una encuesta breve sobre el programa KM0 LAB.',
    en: 'Answer a short survey about the KM0 LAB programme.',
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
    ca: 'Rebràs 500 punts pel teu aniversari 🎂',
    es: 'Recibirás 500 puntos por tu cumpleaños 🎂',
    en: "You'll get 500 points on your birthday 🎂",
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
  'agenda.when.all': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
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
  'agenda.cats.label': {
    ca: 'Categories',
    es: 'Categorías',
    en: 'Categories',
  } as Dict,
  'agenda.cats.hide': { ca: 'Ocultar', es: 'Ocultar', en: 'Hide' } as Dict,
  'agenda.cats.show': {
    ca: 'Mostrar',
    es: 'Mostrar',
    en: 'Show',
  } as Dict,
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
    ca: 'Els punts de {nom} ja són teus. Cada comerç dona punts un sol cop — però pots consultar les seves promocions!',
    es: 'Los puntos de {nom} ya son tuyos. Cada comercio da puntos una sola vez — ¡pero puedes consultar sus promociones!',
    en: "You already earned {nom}'s points. Each shop gives points only once — but you can still check its promotions!",
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
  // ── Invite and earn ───────────────────────────────────────
  'invite.title': {
    ca: 'Invita i guanya',
    es: 'Invita y gana',
    en: 'Invite and earn',
  } as Dict,
  'invite.subtitle': {
    ca: 'Tu comparteixes. Es registren. Tu sumes punts',
    es: 'Tú compartes. Se registran. Tú sumas puntos',
    en: 'You share. They sign up. You earn points',
  } as Dict,
  'invite.home.title': {
    ca: 'Invita i guanya punts',
    es: 'Invita y gana puntos',
    en: 'Invite and earn points',
  } as Dict,
  'invite.home.description': {
    ca: 'Comparteix KM0 Lab amb persones i negocis del teu municipi',
    es: 'Comparte KM0 Lab con personas y negocios de tu municipio',
    en: 'Share KM0 Lab with people and businesses in your town',
  } as Dict,
  'invite.home.cta': { ca: 'Invitar', es: 'Invitar', en: 'Invite' } as Dict,
  'invite.home.note': {
    ca: 'Guanyes punts quan completen el registre amb la teva invitació',
    es: 'Ganas puntos cuando completan el registro con tu invitación',
    en: 'You earn points when they complete registration with your invitation',
  } as Dict,
  'invite.person.short': { ca: 'Persona', es: 'Persona', en: 'Person' } as Dict,
  'invite.business.short': {
    ca: 'Negoci',
    es: 'Negocio',
    en: 'Business',
  } as Dict,
  'invite.person.title': {
    ca: 'Invita una persona',
    es: 'Invitar a una persona',
    en: 'Invite a person',
  } as Dict,
  'invite.person.description': {
    ca: 'Els rebràs quan es registri amb la teva invitació',
    es: 'Los recibirás cuando se registre con tu invitación',
    en: 'You will receive them when they register with your invitation',
  } as Dict,
  'invite.business.title': {
    ca: 'Invita un negoci',
    es: 'Invitar a un negocio',
    en: 'Invite a business',
  } as Dict,
  'invite.business.description': {
    ca: "Els rebràs quan completi l'alta del seu negoci",
    es: 'Los recibirás cuando complete el alta de su negocio',
    en: 'You will receive them when they complete their business registration',
  } as Dict,
  'invite.share.person_title': {
    ca: 'La teva invitació per a una persona',
    es: 'Tu invitación para una persona',
    en: 'Your invitation for a person',
  } as Dict,
  'invite.share.business_title': {
    ca: 'La teva invitació per a un negoci',
    es: 'Tu invitación para un negocio',
    en: 'Your invitation for a business',
  } as Dict,
  'invite.share.explanation': {
    ca: 'Aquest enllaç permet saber que la invitació ve de tu',
    es: 'Este enlace permite saber que la invitación viene de ti',
    en: 'This link identifies that the invitation came from you',
  } as Dict,
  'invite.share.person_text': {
    ca: "Descobreix el que tens a prop amb KM0 Lab: comerços, activitats i premis al teu municipi. Registra't amb la meva invitació: {link}",
    es: 'Descubre lo que tienes cerca con KM0 Lab: comercios, actividades y premios en tu municipio. Regístrate con mi invitación: {link}',
    en: 'Discover what is near you with KM0 Lab: shops, activities and rewards in your town. Sign up with my invitation: {link}',
  } as Dict,
  'invite.share.business_text': {
    ca: "Tens un negoci? Suma't a KM0 Lab i dona a conèixer el teu establiment al municipi. Registra el teu negoci aquí: {link}",
    es: '¿Tienes un negocio? Súmate a KM0 Lab y da a conocer tu establecimiento en el municipio. Registra tu negocio aquí: {link}',
    en: 'Do you own a business? Join KM0 Lab and promote your establishment locally. Register your business here: {link}',
  } as Dict,
  'invite.copied': {
    ca: 'Enllaç copiat',
    es: 'Enlace copiado',
    en: 'Link copied',
  } as Dict,
  'invite.copy_failed': {
    ca: "Selecciona i copia l'enllaç manualment",
    es: 'Selecciona y copia el enlace manualmente',
    en: 'Select and copy the link manually',
  } as Dict,
  'invite.applied': {
    ca: 'Invitació aplicada',
    es: 'Invitación aplicada',
    en: 'Invitation applied',
  } as Dict,
  'invite.empty.title': {
    ca: 'Encara no hi ha cap invitació',
    es: 'Todavía no hay ninguna invitación',
    en: 'There are no invitations yet',
  } as Dict,
  'invite.empty.description': {
    ca: 'Quan estiguis a punt, podràs crear el teu enllaç personal aquí.',
    es: 'Cuando estés listo, podrás crear tu enlace personal aquí.',
    en: 'When you are ready, you can create your personal link here.',
  } as Dict,
  'invite.error.title': {
    ca: 'No hem pogut preparar la invitació',
    es: 'No hemos podido preparar la invitación',
    en: 'We could not prepare the invitation',
  } as Dict,
  'invite.error.description': {
    ca: 'Torna-ho a provar per obtenir el teu enllaç personal.',
    es: 'Vuelve a intentarlo para obtener tu enlace personal.',
    en: 'Try again to get your personal link.',
  } as Dict,
  'invite.error.retry': {
    ca: 'Tornar-ho a provar',
    es: 'Reintentar',
    en: 'Try again',
  } as Dict,
  'invite.action.description': {
    ca: 'Convida persones o negocis i guanya punts quan completin el registre',
    es: 'Invita a personas o negocios y gana puntos cuando completen el registro',
    en: 'Invite people or businesses and earn points when they complete registration',
  } as Dict,
  'invite.action.type': {
    ca: 'Invitacions',
    es: 'Invitaciones',
    en: 'Invitations',
  } as Dict,
  'share.title': {
    ca: 'Comparteix KM0 Lab',
    es: 'Comparte KM0 Lab',
    en: 'Share KM0 Lab',
  } as Dict,
  'share.home.description': {
    ca: 'Ajuda altres persones a descobrir els comerços, serveis i activitats del teu municipi',
    es: 'Ayuda a otras personas a descubrir los comercios, servicios y actividades de tu municipio',
    en: 'Help other people discover the shops, services and activities in your town',
  } as Dict,
  'share.cta': { ca: 'Compartir', es: 'Compartir', en: 'Share' } as Dict,
  'share.copy': {
    ca: "Copia l'enllaç",
    es: 'Copiar enlace',
    en: 'Copy link',
  } as Dict,
  'share.points_question': {
    ca: 'Vols guanyar punts amb les teves invitacions?',
    es: '¿Quieres ganar puntos por tus invitaciones?',
    en: 'Do you want to earn points for your invitations?',
  } as Dict,
  'share.create_account': {
    ca: 'Crea el teu compte',
    es: 'Crea tu cuenta',
    en: 'Create your account',
  } as Dict,
  'share.login': {
    ca: 'Inicia sessió',
    es: 'Iniciar sesión',
    en: 'Sign in',
  } as Dict,
  'share.points_block.title': {
    ca: 'Guanya punts amb les teves invitacions',
    es: 'Gana puntos por tus invitaciones',
    en: 'Earn points for your invitations',
  } as Dict,
  'share.points_block.description': {
    ca: 'Inicia sessió o crea el teu compte per obtenir el teu enllaç personal i guanyar punts quan algú es registri.',
    es: 'Inicia sesión o crea tu cuenta para obtener tu enlace personal y ganar puntos cuando alguien se registre.',
    en: 'Sign in or create your account to get your personal link and earn points when someone registers.',
  } as Dict,
  'invite.home.description_authed': {
    ca: 'Comparteix KM0 Lab amb altres persones i negocis del municipi',
    es: 'Comparte KM0 Lab con otras personas y negocios del municipio',
    en: 'Share KM0 Lab with other people and businesses in your town',
  } as Dict,
  'invite.header.subtitle': {
    ca: 'Tria a qui vols convidar i com vols enviar la invitació',
    es: 'Elige a quién quieres invitar y cómo quieres enviar la invitación',
    en: 'Choose who you want to invite and how to send the invitation',
  } as Dict,
  'invite.select.person': {
    ca: 'Una persona',
    es: 'Una persona',
    en: 'A person',
  } as Dict,
  'invite.select.business': {
    ca: 'Un negoci',
    es: 'Un negocio',
    en: 'A business',
  } as Dict,
  'invite.explain.person': {
    ca: 'Guanyaràs {points} punts quan una persona nova completi el registre amb la teva invitació',
    es: 'Ganarás {points} puntos cuando una persona nueva complete el registro con tu invitación',
    en: 'You will earn {points} points when a new person completes registration with your invitation',
  } as Dict,
  'invite.explain.business': {
    ca: "Guanyaràs {points} punts quan un negoci nou completi el formulari d'alta amb la teva invitació",
    es: 'Ganarás {points} puntos cuando un negocio nuevo complete el formulario de alta con tu invitación',
    en: 'You will earn {points} points when a new business completes the registration form with your invitation',
  } as Dict,
  'invite.channels.title': {
    ca: 'Com vols enviar la invitació?',
    es: '¿Cómo quieres enviar la invitación?',
    en: 'How do you want to send the invitation?',
  } as Dict,
  'invite.session.expired.title': {
    ca: 'La teva sessió ha caducat',
    es: 'Tu sesión ha caducado',
    en: 'Your session has expired',
  } as Dict,
  'invite.session.expired.description': {
    ca: 'Recupera la sessió per generar invitacions amb punts.',
    es: 'Recupera la sesión para generar invitaciones con puntos.',
    en: 'Restore your session to create invitations with points.',
  } as Dict,
  'share.panel.notice': {
    ca: 'Com que no has iniciat sessió, aquesta invitació no et donarà punts. Si vols guanyar-ne quan algú es registri amb la teva invitació, crea un compte o inicia sessió abans de compartir.',
    es: 'Como no has iniciado sesión, esta invitación no te dará puntos. Si quieres ganarlos cuando alguien se registre con tu invitación, crea una cuenta o inicia sesión antes de compartir.',
    en: 'As you are not signed in, this invitation will not earn you points. To earn them when someone registers with your invitation, create an account or sign in before sharing.',
  } as Dict,
  'share.panel.how': {
    ca: 'Com ho vols compartir?',
    es: '¿Cómo quieres compartirlo?',
    en: 'How do you want to share it?',
  } as Dict,
  'share.channel.whatsapp': {
    ca: 'WhatsApp',
    es: 'WhatsApp',
    en: 'WhatsApp',
  } as Dict,
  'share.channel.email': {
    ca: 'Correu electrònic',
    es: 'Correo electrónico',
    en: 'Email',
  } as Dict,
  'share.channel.facebook': {
    ca: 'Facebook',
    es: 'Facebook',
    en: 'Facebook',
  } as Dict,
  'share.channel.more': {
    ca: 'Més opcions',
    es: 'Más opciones',
    en: 'More options',
  } as Dict,
  'share.message': {
    ca: "Descobreix l'agenda, les notícies, els comerços i els serveis de {town} a KM0 Lab. Pots consultar-ho sense registrar-te: {link}",
    es: 'Descubre la agenda, las noticias, los comercios y los servicios de {town} en KM0 Lab. Puedes consultarlo sin registrarte: {link}',
    en: 'Discover the events, news, shops and services of {town} on KM0 Lab. You can browse it without signing up: {link}',
  } as Dict,
  'share.email_subject': {
    ca: 'Descobreix KM0 Lab a {town}',
    es: 'Descubre KM0 Lab en {town}',
    en: 'Discover KM0 Lab in {town}',
  } as Dict,
  'share.town_fallback': {
    ca: 'el teu municipi',
    es: 'tu municipio',
    en: 'your town',
  } as Dict,

  // ── Business registration ─────────────────────────────────
  'business.title': {
    ca: "Dona d'alta el teu negoci",
    es: 'Da de alta tu negocio',
    en: 'Register your business',
  } as Dict,
  'business.description': {
    ca: 'Forma part de la xarxa de comerços i serveis del teu municipi',
    es: 'Forma parte de la red de comercios y servicios de tu municipio',
    en: "Join your town's network of shops and services",
  } as Dict,
  'business.group.business': {
    ca: 'El teu negoci',
    es: 'Tu negocio',
    en: 'Your business',
  } as Dict,
  'business.group.location': {
    ca: 'On ets',
    es: 'Dónde estás',
    en: 'Where you are',
  } as Dict,
  'business.group.contact': {
    ca: 'Contacte i accés',
    es: 'Contacto y acceso',
    en: 'Contact and access',
  } as Dict,
  'business.name': {
    ca: 'Nom comercial',
    es: 'Nombre comercial',
    en: 'Business name',
  } as Dict,
  'business.tax_id': { ca: 'NIF/CIF', es: 'NIF/CIF', en: 'Tax ID' } as Dict,
  'business.category': {
    ca: 'Categoria',
    es: 'Categoría',
    en: 'Category',
  } as Dict,
  'business.category.placeholder': {
    ca: 'Selecciona una categoria',
    es: 'Selecciona una categoría',
    en: 'Select a category',
  } as Dict,
  'business.category.shop': {
    ca: 'Comerç',
    es: 'Comercio',
    en: 'Retail',
  } as Dict,
  'business.category.food': {
    ca: 'Restauració',
    es: 'Restauración',
    en: 'Food and drink',
  } as Dict,
  'business.category.service': {
    ca: 'Serveis',
    es: 'Servicios',
    en: 'Services',
  } as Dict,
  'business.category.culture': {
    ca: 'Cultura i oci',
    es: 'Cultura y ocio',
    en: 'Culture and leisure',
  } as Dict,
  'business.short_description': {
    ca: 'Breu descripció',
    es: 'Breve descripción',
    en: 'Short description',
  } as Dict,
  'business.website': {
    ca: 'Web o perfil a xarxes socials',
    es: 'Web o perfil en redes sociales',
    en: 'Website or social profile',
  } as Dict,
  'business.logo': { ca: 'Logotip', es: 'Logo', en: 'Logo' } as Dict,
  'business.logo.add': {
    ca: 'Afegir logotip',
    es: 'Añadir logo',
    en: 'Add logo',
  } as Dict,
  'business.logo.replace': {
    ca: 'Substituir',
    es: 'Sustituir',
    en: 'Replace',
  } as Dict,
  'business.logo.remove': {
    ca: 'Eliminar',
    es: 'Eliminar',
    en: 'Remove',
  } as Dict,
  'business.address': { ca: 'Adreça', es: 'Dirección', en: 'Address' } as Dict,
  'business.town': { ca: 'Municipi', es: 'Municipio', en: 'Town' } as Dict,
  'business.contact_name': {
    ca: 'Nom de la persona de contacte',
    es: 'Nombre de la persona de contacto',
    en: 'Contact person name',
  } as Dict,
  'business.email': {
    ca: 'Correu electrònic',
    es: 'Correo electrónico',
    en: 'Email',
  } as Dict,
  'business.email.session_hint': {
    ca: 'Utilitzarem el correu del teu compte actual.',
    es: 'Usaremos el correo de tu cuenta actual.',
    en: 'We will use your current account email.',
  } as Dict,
  'business.email.access_hint': {
    ca: "T'enviarem les instruccions per accedir a l'espai del negoci.",
    es: 'Te enviaremos las instrucciones para acceder al espacio del negocio.',
    en: 'We will send instructions to access the business area.',
  } as Dict,
  'business.phone': {
    ca: 'Telèfon (opcional)',
    es: 'Teléfono (opcional)',
    en: 'Phone (optional)',
  } as Dict,
  'business.terms': {
    ca: "Accepto les condicions d'ús i la política de privacitat",
    es: 'Acepto las condiciones de uso y la política de privacidad',
    en: 'I accept the terms of use and privacy policy',
  } as Dict,
  'business.submit': {
    ca: 'Crear el meu negoci',
    es: 'Crear mi negocio',
    en: 'Create my business',
  } as Dict,
  'business.submitting': {
    ca: 'Creant el teu negoci…',
    es: 'Creando tu negocio…',
    en: 'Creating your business…',
  } as Dict,
  'business.error.required': {
    ca: 'Aquest camp és obligatori',
    es: 'Este campo es obligatorio',
    en: 'This field is required',
  } as Dict,
  'business.error.email': {
    ca: 'Introdueix un correu vàlid',
    es: 'Introduce un correo válido',
    en: 'Enter a valid email',
  } as Dict,
  'business.error.url': {
    ca: 'Introdueix una adreça web vàlida',
    es: 'Introduce una dirección web válida',
    en: 'Enter a valid web address',
  } as Dict,
  'business.error.terms': {
    ca: "Has d'acceptar les condicions i la privacitat",
    es: 'Debes aceptar las condiciones y la privacidad',
    en: 'You must accept the terms and privacy policy',
  } as Dict,
  'business.error.submit': {
    ca: 'No hem pogut crear el negoci. Conservem les dades perquè ho tornis a provar.',
    es: 'No hemos podido crear el negocio. Conservamos los datos para que vuelvas a intentarlo.',
    en: 'We could not create the business. Your details are preserved so you can retry.',
  } as Dict,
  'business.retry': {
    ca: 'Tornar-ho a provar',
    es: 'Reintentar',
    en: 'Try again',
  } as Dict,
  'business.already.title': {
    ca: 'Aquest negoci ja està registrat',
    es: 'Este negocio ya está registrado',
    en: 'This business is already registered',
  } as Dict,
  'business.already.description': {
    ca: 'Inicia sessió amb el compte gestor o contacta amb ajuda si no hi pots accedir.',
    es: 'Inicia sesión con la cuenta gestora o contacta con ayuda si no puedes acceder.',
    en: 'Sign in with the manager account or contact support if you cannot access it.',
  } as Dict,
  'business.already.login': {
    ca: 'Iniciar sessió',
    es: 'Iniciar sesión',
    en: 'Sign in',
  } as Dict,
  'business.already.help': {
    ca: 'Demanar ajuda',
    es: 'Solicitar ayuda',
    en: 'Get help',
  } as Dict,
  'business.success.title': {
    ca: 'El teu negoci ja està registrat',
    es: 'Tu negocio ya está registrado',
    en: 'Your business is registered',
  } as Dict,
  'business.success.description': {
    ca: 'Ja pots accedir al teu espai i completar la informació del teu negoci.',
    es: 'Ya puedes acceder a tu espacio y completar la información de tu negocio.',
    en: 'You can now access your space and complete your business information.',
  } as Dict,
  'business.success.cta': {
    ca: 'Accedir al meu negoci',
    es: 'Acceder a mi negocio',
    en: 'Access my business',
  } as Dict,
  'business.success.mock_note': {
    ca: 'Accés simulat per al pilot',
    es: 'Acceso simulado para el piloto',
    en: 'Simulated access for the pilot',
  } as Dict,
  'business.empty.title': {
    ca: 'No hi ha dades del negoci',
    es: 'No hay datos del negocio',
    en: 'No business details',
  } as Dict,
  'business.empty.cta': {
    ca: "Començar l'alta",
    es: 'Empezar el alta',
    en: 'Start registration',
  } as Dict,

  'invites.link': {
    ca: 'Les meves invitacions',
    es: 'Mis invitaciones',
    en: 'My invitations',
  } as Dict,
  'invites.title': {
    ca: 'Les meves invitacions',
    es: 'Mis invitaciones',
    en: 'My invitations',
  } as Dict,
  'invites.subtitle': {
    ca: 'Registres vinculats a les teves invitacions',
    es: 'Registros vinculados a tus invitaciones',
    en: 'Registrations linked to your invitations',
  } as Dict,
  'invites.cta': { ca: 'Invitar', es: 'Invitar', en: 'Invite' } as Dict,
  'invites.summary.persons': {
    ca: 'Persones registrades',
    es: 'Personas registradas',
    en: 'People registered',
  } as Dict,
  'invites.summary.businesses': {
    ca: 'Negocis registrats',
    es: 'Negocios registrados',
    en: 'Businesses registered',
  } as Dict,
  'invites.summary.points': {
    ca: 'Punts guanyats',
    es: 'Puntos ganados',
    en: 'Points earned',
  } as Dict,
  'invites.filter.all': { ca: 'Totes', es: 'Todas', en: 'All' } as Dict,
  'invites.filter.persons': {
    ca: 'Persones',
    es: 'Personas',
    en: 'People',
  } as Dict,
  'invites.filter.businesses': {
    ca: 'Negocis',
    es: 'Negocios',
    en: 'Businesses',
  } as Dict,
  'invites.status.started': {
    ca: 'Registre iniciat',
    es: 'Registro iniciado',
    en: 'Registration started',
  } as Dict,
  'invites.status.pending': {
    ca: 'Registre completat · Punts pendents',
    es: 'Registro completado · Puntos pendientes',
    en: 'Registration completed · Points pending',
  } as Dict,
  'invites.status.granted': {
    ca: 'Punts concedits',
    es: 'Puntos concedidos',
    en: 'Points granted',
  } as Dict,
  'invites.row.person': {
    ca: 'Persona convidada',
    es: 'Persona invitada',
    en: 'Invited person',
  } as Dict,
  'invites.row.business': {
    ca: 'Negoci convidat',
    es: 'Negocio invitado',
    en: 'Invited business',
  } as Dict,
  'invites.milestone.started': {
    ca: 'Registre iniciat',
    es: 'Registro iniciado',
    en: 'Registration started',
  } as Dict,
  'invites.milestone.completed': {
    ca: 'Registre completat',
    es: 'Registro completado',
    en: 'Registration completed',
  } as Dict,
  'invites.milestone.granted': {
    ca: 'Punts concedits',
    es: 'Puntos concedidos',
    en: 'Points granted',
  } as Dict,
  'invites.detail.see_points': {
    ca: 'Veure als meus punts',
    es: 'Ver en mis puntos',
    en: 'See in my points',
  } as Dict,
  'invites.detail.pending_note': {
    ca: 'Els punts pendents encara no formen part del teu saldo.',
    es: 'Los puntos pendientes todavía no forman parte de tu saldo.',
    en: 'Pending points are not part of your balance yet.',
  } as Dict,
  'invites.detail.open': {
    ca: 'Veure el detall',
    es: 'Ver el detalle',
    en: 'View details',
  } as Dict,
  'invites.empty.title': {
    ca: 'Encara no hi ha registres vinculats a les teves invitacions.',
    es: 'Todavía no hay registros vinculados a tus invitaciones.',
    en: 'There are no registrations linked to your invitations yet.',
  } as Dict,
  'invites.empty.description': {
    ca: 'Comparteix el teu enllaç i consulta aquí els resultats.',
    es: 'Comparte tu enlace y consulta aquí los resultados.',
    en: 'Share your link and check the results here.',
  } as Dict,
  'invites.disclaimer': {
    ca: "Compartir un enllaç no confirma que s'hagi enviat ni que algú s'hagi registrat.",
    es: 'Compartir un enlace no confirma que se haya enviado ni que alguien se haya registrado.',
    en: 'Sharing a link does not confirm it was sent or that anyone registered.',
  } as Dict,
  'invites.filter_empty.title': {
    ca: 'Cap registre amb aquest filtre',
    es: 'Ningún registro con este filtro',
    en: 'No registrations with this filter',
  } as Dict,
  'invites.filter_empty.description': {
    ca: 'Prova amb «Totes» per veure tots els registres.',
    es: 'Prueba con «Todas» para ver todos los registros.',
    en: 'Try “All” to see every registration.',
  } as Dict,
  'invites.error.title': {
    ca: 'No hem pogut carregar les teves invitacions',
    es: 'No hemos podido cargar tus invitaciones',
    en: 'We could not load your invitations',
  } as Dict,
  'invites.error.description': {
    ca: 'Torna-ho a provar en un moment.',
    es: 'Vuelve a intentarlo en un momento.',
    en: 'Please try again in a moment.',
  } as Dict,
  'invites.error.retry': {
    ca: 'Tornar-ho a provar',
    es: 'Reintentar',
    en: 'Try again',
  } as Dict,
  'invites.compact.person.one': {
    ca: '{count} persona registrada',
    es: '{count} persona registrada',
    en: '{count} person registered',
  } as Dict,
  'invites.compact.person.other': {
    ca: '{count} persones registrades',
    es: '{count} personas registradas',
    en: '{count} people registered',
  } as Dict,
  'invites.compact.business.one': {
    ca: '{count} negoci registrat',
    es: '{count} negocio registrado',
    en: '{count} business registered',
  } as Dict,
  'invites.compact.business.other': {
    ca: '{count} negocis registrats',
    es: '{count} negocios registrados',
    en: '{count} businesses registered',
  } as Dict,
  'invites.compact.and': { ca: 'i', es: 'y', en: 'and' } as Dict,
  'invites.compact.points': {
    ca: 'punts guanyats',
    es: 'puntos ganados',
    en: 'points earned',
  } as Dict,
  'invites.points.title': {
    ca: 'Punts per invitacions',
    es: 'Puntos por invitaciones',
    en: 'Invitation points',
  } as Dict,
  'invites.points.earned': {
    ca: '{points} punts guanyats',
    es: '{points} puntos ganados',
    en: '{points} points earned',
  } as Dict,
  'invites.points.empty': {
    ca: 'Encara no has guanyat punts per invitacions',
    es: 'Todavía no has ganado puntos por invitaciones',
    en: 'You have not earned invitation points yet',
  } as Dict,
  'invites.points.action': {
    ca: 'Veure invitacions',
    es: 'Ver invitaciones',
    en: 'View invitations',
  } as Dict,
} as const

export type TKey = keyof typeof D

export const t = (key: TKey, lang: Lang): string => {
  const entry = D[key]
  return entry?.[lang] ?? entry?.es ?? String(key)
}
