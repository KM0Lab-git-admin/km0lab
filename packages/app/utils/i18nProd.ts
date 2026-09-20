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

type Dict = Record<Lang, string>

const DP = {
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
