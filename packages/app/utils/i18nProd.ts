/**
 * i18nProd — claves de traduccion propias de PRODUCCION.
 *
 * `utils/i18n.ts` es propiedad de Lovable: `pnpm sync:lovable` lo
 * sobrescribe entero en cada ronda. Las claves que solo existen en
 * produccion (comercios reales, horarios, categorias, escaner nativo,
 * tipos de accion de puntos del backend) desaparecian en cada sync.
 *
 * Por eso viven aqui: este archivo esta en `locked` dentro de
 * `scripts/lovable-manifest.json` y el sync nunca lo toca. El barrel
 * `utils/index.ts` reexporta desde aqui `t` y `TKey` ya fusionados, de
 * modo que los consumidores siguen importando lo mismo de '@km0lab/app'.
 *
 * Para anadir una clave: si la usa una pantalla que Lovable maqueta, va
 * en Lovable y llega por sync. Si la usa codigo que solo existe en
 * produccion, va aqui.
 */

import { t as tBase, type Lang, type TKey as TKeyBase } from './i18n'

/** Reexportado para los tipos que el porte trae de Lovable. */
export type { Lang }

type Dict = Record<Lang, string>

const EMPTY: Dict = { ca: '', es: '', en: '' }

const DP = {
  // ── Avisos de maqueta ──────────────────────────────────────────────
  // Lovable enseña en sus pantallas que los datos son de ejemplo. En
  // producción todo sale de la API, así que estos avisos quedan vacíos.
  'account.demo': EMPTY,
  'account.sheet.demo': EMPTY,
  'catalog.sample': EMPTY,
  'business.success.mock_note': EMPTY,
  'business.email.access_hint': EMPTY,
  // ── Textos que producción dice distinto que la maqueta ─────────────
  'postal.subtitle': {
    ca: 'Per a la demo, utilitza el codi 00000',
    es: 'Para la demo, utiliza el código 00000',
    en: 'For the demo, use postal code 00000',
  } as Dict,
  'postal.placeholder': { ca: '00000', es: '00000', en: '00000' } as Dict,
  // Pantalla «actualiza la app» (docs/VERSIONES.md). Es de producción.
  'update.title': {
    ca: "Cal actualitzar l'app",
    es: 'Hay que actualizar la app',
    en: 'Please update the app',
  } as Dict,
  'update.body': {
    ca: 'Aquesta versió ja no és compatible. Actualitza-la des de la botiga per continuar.',
    es: 'Esta versión ya no es compatible. Actualízala desde la tienda para continuar.',
    en: 'This version is no longer supported. Update it from the store to continue.',
  } as Dict,
  'update.body_web': {
    ca: 'Hi ha una versió nova. Torna a carregar la pàgina per continuar.',
    es: 'Hay una versión nueva. Vuelve a cargar la página para continuar.',
    en: 'There is a new version. Reload the page to continue.',
  } as Dict,
  'update.cta': {
    ca: 'Actualitzar',
    es: 'Actualizar',
    en: 'Update',
  } as Dict,
  'update.cta_web': {
    ca: 'Tornar a carregar',
    es: 'Volver a cargar',
    en: 'Reload',
  } as Dict,
  // La maqueta fija «100 puntos»; cada municipio configura los suyos y la
  // cifra real ya sale en grande en el mismo aviso.
  'home.welcome.points': {
    ca: 'Has guanyat els teus punts de benvinguda',
    es: 'Has ganado tus puntos de bienvenida',
    en: 'You earned your welcome points',
  } as Dict,
  'postal.error_connection': {
    ca: 'No hem pogut comprovar el codi postal. Torna-ho a provar.',
    es: 'No hemos podido comprobar el código postal. Vuelve a intentarlo.',
    en: 'We could not check the postal code. Please try again.',
  } as Dict,
  // ── Acceso y verificación: pantallas de producción ─────────────────
  // Login y CheckEmail tienen candado y hablan de un correo real; la
  // maqueta cambió estos textos para avisar de que allí es simulado.
  'login.subtitle': {
    ca: "T'enviarem un codi al teu correu",
    es: 'Te enviaremos un código a tu correo',
    en: "We'll send a code to your email",
  } as Dict,
  'login.submitting': {
    ca: 'Enviant codi…',
    es: 'Enviando código…',
    en: 'Sending code…',
  } as Dict,
  'login.toast_sent': {
    ca: "T'hem enviat un codi per correu",
    es: 'Te hemos enviado un código por email',
    en: "We've sent you a code by email",
  } as Dict,
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
  // Cada motivo de fallo al entrar tiene su mensaje (services/auth.ts).
  'otp.toast_expired': {
    ca: "Aquest codi ha caducat. Demana'n un de nou.",
    es: 'Este código ha caducado. Pide uno nuevo.',
    en: 'This code has expired. Request a new one.',
  } as Dict,
  'otp.toast_too_many': {
    ca: 'Massa intents. Espera uns minuts i demana un codi nou.',
    es: 'Demasiados intentos. Espera unos minutos y pide un código nuevo.',
    en: 'Too many attempts. Wait a few minutes and request a new code.',
  } as Dict,
  'otp.toast_offline': {
    ca: 'Sense connexió. Comprova la xarxa i torna-ho a provar.',
    es: 'Sin conexión. Comprueba la red e inténtalo de nuevo.',
    en: 'No connection. Check your network and try again.',
  } as Dict,
  'otp.toast_send_failed': {
    ca: "No hem pogut enviar el correu. Torna-ho a provar d'aquí a uns minuts.",
    es: 'No hemos podido enviar el correo. Inténtalo de nuevo en unos minutos.',
    en: "We couldn't send the email. Please try again in a few minutes.",
  } as Dict,
  'otp.toast_error': {
    ca: "Alguna cosa ha fallat. Torna-ho a provar d'aquí a una estona.",
    es: 'Algo ha fallado. Inténtalo de nuevo dentro de un rato.',
    en: 'Something went wrong. Please try again in a while.',
  } as Dict,
  'login.scan_pending': {
    ca: 'Entra i sumarem els punts de la teva visita',
    es: 'Entra y sumaremos los puntos de tu visita',
    en: "Sign in and we'll add the points for your visit",
  } as Dict,
  // La regla real no es «una sola vez»: cada comercio vuelve a dar puntos
  // pasado el tiempo de espera del municipio (30 días por defecto).
  'scanner.error.ja_visitat.subtitle': {
    ca: 'Ja has sumat els punts de {nom}. Hi podràs tornar a sumar a partir del {data}. Mentrestant, mira les seves promocions!',
    es: 'Ya has sumado los puntos de {nom}. Podrás volver a sumar aquí a partir del {data}. Mientras tanto, ¡mira sus promociones!',
    en: "You've already earned {nom}'s points. You can earn here again from {data}. Meanwhile, check its promotions!",
  } as Dict,
  'scanner.error.ja_visitat.subtitle_once': {
    ca: 'Ja has sumat els punts de {nom}. Cada comerç dona punts un sol cop. Mentrestant, mira les seves promocions!',
    es: 'Ya has sumado los puntos de {nom}. Cada comercio da puntos una sola vez. Mientras tanto, ¡mira sus promociones!',
    en: "You've already earned {nom}'s points. Each shop gives points only once. Meanwhile, check its promotions!",
  } as Dict,
  'demo.notice.account_is_real': {
    ca: 'Aquest compte ja és de {town}: t’hi portem. Per provar la demostració, entra amb un altre correu.',
    es: 'Esta cuenta ya es de {town}: te llevamos allí. Para probar la demostración, entra con otro correo.',
    en: 'This account already belongs to {town}: taking you there. To try the demo, sign in with another email.',
  } as Dict,
  'demo.notice.left_demo': {
    ca: 'El teu compte era de demostració. Ara ets de {town} i comences amb 0 punts: els de la demostració no compten.',
    es: 'Tu cuenta era de demostración. Ahora eres de {town} y empiezas con 0 puntos: los de la demostración no cuentan.',
    en: 'Your account was a demo one. You now belong to {town} and start with 0 points: demo points do not count.',
  } as Dict,
  'demo.notice.real_account_blocked': {
    ca: 'Has entrat amb un compte de {town}. Per provar la demostració, tanca la sessió i entra amb un altre correu.',
    es: 'Has entrado con una cuenta de {town}. Para probar la demostración, cierra la sesión y entra con otro correo.',
    en: 'You are signed in with an account from {town}. To try the demo, sign out and use another email.',
  } as Dict,
  'otp.footer_hint': {
    ca: 'No el trobes? Mira a la carpeta de spam o promocions.',
    es: '¿No lo encuentras? Mira en spam o promociones.',
    en: "Can't find it? Check spam or promotions.",
  } as Dict,
  'home.demo.badge': {
    ca: 'Mode demo',
    es: 'Modo demo',
    en: 'Demo mode',
  } as Dict,
  'merchant.day.friday': {
    ca: 'Divendres',
    es: 'Viernes',
    en: 'Friday',
  } as Dict,
  'merchant.day.monday': { ca: 'Dilluns', es: 'Lunes', en: 'Monday' } as Dict,
  'merchant.day.saturday': {
    ca: 'Dissabte',
    es: 'Sábado',
    en: 'Saturday',
  } as Dict,
  'merchant.day.sunday': {
    ca: 'Diumenge',
    es: 'Domingo',
    en: 'Sunday',
  } as Dict,
  'merchant.day.thursday': {
    ca: 'Dijous',
    es: 'Jueves',
    en: 'Thursday',
  } as Dict,
  'merchant.day.tuesday': {
    ca: 'Dimarts',
    es: 'Martes',
    en: 'Tuesday',
  } as Dict,
  'merchant.day.wednesday': {
    ca: 'Dimecres',
    es: 'Miércoles',
    en: 'Wednesday',
  } as Dict,
  'merchant.hours.closed': {
    ca: 'Tancat',
    es: 'Cerrado',
    en: 'Closed',
  } as Dict,
  'merchant.info.week': {
    ca: 'Horari setmanal',
    es: 'Horario semanal',
    en: 'Weekly hours',
  } as Dict,
  'merchant.status.not_scanned': {
    ca: 'Encara no visitat',
    es: 'Aún no visitado',
    en: 'Not visited yet',
  } as Dict,
  'merchant.status.scanned': {
    ca: 'Ja escanejat',
    es: 'Ya escaneado',
    en: 'Already scanned',
  } as Dict,
  'merchants.card.not_scanned': {
    ca: 'Encara no escanejat',
    es: 'Aún no escaneado',
    en: 'Not scanned',
  } as Dict,
  'merchants.card.scanned': {
    ca: 'Ja escanejat',
    es: 'Ya escaneado',
    en: 'Scanned',
  } as Dict,
  'merchants.scan_filter.all': { ca: 'Tots', es: 'Todos', en: 'All' } as Dict,
  'merchants.scan_filter.pending': {
    ca: 'Pendents',
    es: 'Pendientes',
    en: 'Pending',
  } as Dict,
  'merchants.scan_filter.scanned': {
    ca: 'Escanejats',
    es: 'Escaneados',
    en: 'Scanned',
  } as Dict,
  'points.actions.custom.description': {
    ca: 'Respon una enquesta breu sobre el programa KM0 LAB.',
    es: 'Responde una encuesta breve sobre el programa KM0 LAB.',
    en: 'Answer a short survey about the KM0 LAB programme.',
  } as Dict,
  'points.actions.custom.title': {
    ca: 'Enquesta de satisfacció',
    es: 'Encuesta de satisfacción',
    en: 'Satisfaction survey',
  } as Dict,
  'points.actions.event.description': {
    ca: 'Inscriu-te a les activitats oficials de la Festa Major.',
    es: 'Inscríbete a las actividades oficiales de la Festa Major.',
    en: 'Sign up for official Festa Major activities.',
  } as Dict,
  'points.actions.event.title': {
    ca: 'Inscripció a la Festa Major',
    es: 'Inscripción a la Festa Major',
    en: 'Sign up for the Festa Major',
  } as Dict,
  'points.actions.qr_scan.description': {
    ca: "Bonificació la primera vegada que s'escaneja un QR de comerç.",
    es: 'Bonificación la primera vez que se escanea un QR de comercio.',
    en: 'Bonus the first time a shop QR is scanned.',
  } as Dict,
  'points.actions.qr_scan.title': {
    ca: "Primer escaneig d'un comerç",
    es: 'Primer escaneo de un comercio',
    en: 'First shop scan',
  } as Dict,
  'points.actions.type.custom': {
    ca: 'Enquesta',
    es: 'Encuesta',
    en: 'Survey',
  } as Dict,
  'points.actions.type.event': {
    ca: 'Inscripció a esdeveniment',
    es: 'Inscripción a evento',
    en: 'Event sign-up',
  } as Dict,
  'points.actions.type.qr_scan': {
    ca: "Escaneig d'un comerç",
    es: 'Escaneo de un comercio',
    en: 'Shop scan',
  } as Dict,
  'points.actions.type.web_signup': {
    ca: 'Registre web',
    es: 'Registro web',
    en: 'Web sign-up',
  } as Dict,
  'points.actions.web_signup.description': {
    ca: 'Rep les novetats del teu ajuntament al correu.',
    es: 'Recibe las novedades de tu ayuntamiento en el correo.',
    en: 'Get the latest news from your town hall by email.',
  } as Dict,
  'points.actions.web_signup.title': {
    ca: 'Registre al butlletí municipal',
    es: 'Registro al boletín municipal',
    en: 'Sign up to the municipal newsletter',
  } as Dict,
  'points.actions.invite_person.title': {
    ca: 'Invitació de veí',
    es: 'Invitación de vecino',
    en: 'Neighbour invitation',
  } as Dict,
  'points.actions.invite_person.description': {
    ca: "Alta d'un veí completada des d'una invitació",
    es: 'Alta de un vecino completada desde una invitación',
    en: 'Completed neighbour signup from an invitation',
  } as Dict,
  'points.actions.invite_business.title': {
    ca: 'Invitació de comerç',
    es: 'Invitación de comercio',
    en: 'Shop invitation',
  } as Dict,
  'points.actions.invite_business.description': {
    ca: "Alta d'un comerç completada des d'una invitació",
    es: 'Alta de un comercio completada desde una invitación',
    en: 'Completed shop signup from an invitation',
  } as Dict,
  'points.actions.type.invite_person': {
    ca: 'Invitació',
    es: 'Invitación',
    en: 'Invitation',
  } as Dict,
  'points.actions.type.invite_business': {
    ca: 'Invitació comerç',
    es: 'Invitación comercio',
    en: 'Shop invitation',
  } as Dict,
  'rewards.scope.all': {
    ca: 'Tots els comerços adherits',
    es: 'Todos los comercios adheridos',
    en: 'All member shops',
  } as Dict,
  'rewards.scope.shops': {
    ca: '{n} comerços adherits',
    es: '{n} comercios adheridos',
    en: '{n} member shops',
  } as Dict,
  'rewards.status.need_register': {
    ca: "Registra't per bescanviar",
    es: 'Regístrate para canjear',
    en: 'Sign up to redeem',
  } as Dict,
  'scanner.camera.permission_denied': {
    ca: 'Cal permís de càmera per escanejar. Activa’l al navegador o puja una imatge del QR.',
    es: 'Se necesita permiso de cámara para escanear. Actívalo en el navegador o sube una imagen del QR.',
    en: 'Camera permission is needed to scan. Enable it in your browser or upload a QR image.',
  } as Dict,
  'scanner.camera.unavailable': {
    ca: 'No hem trobat cap càmera. Pots pujar una imatge del QR del comerç.',
    es: 'No hemos encontrado ninguna cámara. Puedes subir una imagen del QR del comercio.',
    en: 'No camera found. You can upload an image of the shop QR.',
  } as Dict,
  'scanner.confirmation.history': {
    ca: 'Veure historial',
    es: 'Ver historial',
    en: 'View history',
  } as Dict,
  'scanner.deeplink.invalid': {
    ca: 'El codi del enllaç no és vàlid.',
    es: 'El código del enlace no es válido.',
    en: 'The link code is invalid.',
  } as Dict,
  'scanner.upload.cta': {
    ca: 'Pujar imatge',
    es: 'Subir imagen',
    en: 'Upload image',
  } as Dict,
  'scanner.upload.hint': {
    ca: 'O arrossega una foto del QR del comerç',
    es: 'O arrastra una foto del QR del comercio',
    en: 'Or drag a photo of the shop QR',
  } as Dict,
  'shopCategories.bakery': {
    ca: 'Fleca',
    es: 'Panadería',
    en: 'Bakery',
  } as Dict,
  'shopCategories.bar': { ca: 'Bar', es: 'Bar', en: 'Bar' } as Dict,
  'shopCategories.bookstore': {
    ca: 'Llibreria',
    es: 'Librería',
    en: 'Bookstore',
  } as Dict,
  'shopCategories.butcher': {
    ca: 'Carnisseria',
    es: 'Carnicería',
    en: 'Butcher',
  } as Dict,
  'shopCategories.cafe': { ca: 'Cafè', es: 'Café', en: 'Café' } as Dict,
  'shopCategories.clothing': {
    ca: 'Roba',
    es: 'Ropa',
    en: 'Clothing',
  } as Dict,
  'shopCategories.fishmonger': {
    ca: 'Peixateria',
    es: 'Pescadería',
    en: 'Fishmonger',
  } as Dict,
  'shopCategories.food': {
    ca: 'Alimentació',
    es: 'Alimentación',
    en: 'Food',
  } as Dict,
  'shopCategories.greengrocer': {
    ca: 'Fruiteria',
    es: 'Frutería',
    en: 'Greengrocer',
  } as Dict,
  'shopCategories.hairdresser': {
    ca: 'Perruqueria',
    es: 'Peluquería',
    en: 'Hairdresser',
  } as Dict,
  'shopCategories.other': { ca: 'Altres', es: 'Otros', en: 'Other' } as Dict,
  'shopCategories.pharmacy': {
    ca: 'Farmàcia',
    es: 'Farmacia',
    en: 'Pharmacy',
  } as Dict,
  'shopCategories.restaurant': {
    ca: 'Restaurant',
    es: 'Restaurante',
    en: 'Restaurant',
  } as Dict,
  'shopCategories.services': {
    ca: 'Serveis',
    es: 'Servicios',
    en: 'Services',
  } as Dict,
  'points.overlay.earned': {
    ca: 'Has guanyat punts!',
    es: '¡Has ganado puntos!',
    en: 'You earned points!',
  } as Dict,
  'points.overlay.cta': {
    ca: 'Genial!',
    es: '¡Genial!',
    en: 'Great!',
  } as Dict,
  'points.overlay.welcome': {
    ca: 'Benvingut!',
    es: '¡Bienvenido!',
    en: 'Welcome!',
  } as Dict,
  'points.overlay.signup': {
    ca: 'Per registrar-te a KM0 LAB',
    es: 'Por registrarte en KM0 LAB',
    en: 'For signing up to KM0 LAB',
  } as Dict,
  'points.history.type.invite_person': {
    ca: 'Invitació de veí',
    es: 'Invitación de vecino',
    en: 'Neighbour invitation',
  } as Dict,
  'points.history.type.invite_business': {
    ca: 'Invitació de comerç',
    es: 'Invitación de comercio',
    en: 'Business invitation',
  } as Dict,
  'points.history.load_error': {
    ca: "No s'ha pogut carregar l'historial de punts.",
    es: 'No se ha podido cargar el historial de puntos.',
    en: 'Could not load points history.',
  } as Dict,
  'redemptions.mock.badge': {
    ca: 'MOCK',
    es: 'MOCK',
    en: 'MOCK',
  } as Dict,
  'rewards.load_error': {
    ca: "No s'han pogut carregar els premis del municipi.",
    es: 'No se han podido cargar los premios del municipio.',
    en: "Could not load this town's rewards.",
  } as Dict,
} as const

/** Claves que solo existen en produccion. */
export type TKeyProd = keyof typeof DP

/** Union del diccionario de Lovable y el de produccion. */
export type TKey = TKeyBase | TKeyProd

/**
 * Resuelve primero contra el diccionario de produccion y delega en el de
 * Lovable si la clave no es propia. Mismo fallback que `t` en i18n.ts:
 * idioma pedido -> castellano -> la propia clave.
 */
export const t = (key: TKey, lang: Lang): string => {
  const entry = (DP as Record<string, Dict | undefined>)[key as string]
  if (entry) return entry[lang] ?? entry.es ?? String(key)
  return tBase(key as TKeyBase, lang)
}

/** `t` con variables: «Notícies de {town}» → «Notícies de Breda». */
export const tf = (
  key: TKey,
  lang: Lang,
  vars: Record<string, string | number>
): string =>
  t(key, lang).replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  )
