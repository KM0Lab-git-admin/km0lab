import type { TKey } from './i18nProd'
import type { PointActionOut } from '../services/km0labClient'
import type {
  PointAction,
  PointActionIcon,
  PointActionId,
} from '../types/points'

type ActionKeys = {
  id: PointActionId
  /** Lo que las pantallas comparan (`apiType`): el nombre que usa la maqueta. */
  uiType: string
  typeKey: TKey
  titleKey: TKey
  descriptionKey: TKey
  icon: PointActionIcon
}

/**
 * Las formas de ganar puntos que la App sabe enseñar, por el `type` que da
 * la API. En el piloto son tres: registrarse, escanear el QR de un comercio
 * e invitar a un amigo (encargo 13 de Lovable). Una acción de otro tipo que
 * un municipio tuviera encendida no se pinta: la App no tiene pantalla ni
 * textos para ella.
 */
export const TYPE_TO_KEYS: Record<string, ActionKeys> = {
  signup: {
    id: 'signup',
    uiType: 'signup',
    typeKey: 'points.actions.type.signup',
    titleKey: 'points.actions.signup.title',
    descriptionKey: 'points.actions.signup.description',
    icon: 'user-plus',
  },
  qr_scan: {
    id: 'scan',
    uiType: 'scan',
    typeKey: 'points.actions.type.scan',
    titleKey: 'points.actions.scan.title',
    descriptionKey: 'points.actions.scan.description',
    icon: 'qr',
  },
  scan: {
    id: 'scan',
    uiType: 'scan',
    typeKey: 'points.actions.type.scan',
    titleKey: 'points.actions.scan.title',
    descriptionKey: 'points.actions.scan.description',
    icon: 'qr',
  },
  invite_person: {
    id: 'invite_friend',
    uiType: 'invite_friend',
    typeKey: 'points.actions.type.invite_friend',
    titleKey: 'points.actions.invite_friend.title',
    descriptionKey: 'points.actions.invite_friend.description',
    icon: 'share',
  },
}

/** Ledger `type` que completa cada acción (por su tipo de pantalla). */
const ACTION_TYPE_TO_LEDGER: Record<string, string[]> = {
  signup: ['welcome', 'signup'],
  scan: ['scan', 'qr_scan'],
  invite_friend: ['invite_person'],
}

/**
 * Mapea PointActionOut de API a PointAction de UI (completed=false), o null
 * si es un tipo que la App no enseña.
 */
export function toPointAction(out: PointActionOut): PointAction | null {
  const keys = TYPE_TO_KEYS[out.type]
  if (!keys) return null
  return {
    id: out.id,
    apiType: keys.uiType,
    title: out.name?.trim() ?? '',
    description: out.description?.trim() ?? '',
    titleKey: keys.titleKey,
    descriptionKey: keys.descriptionKey,
    typeKey: keys.typeKey,
    points: out.points,
    completed: false,
    icon: keys.icon,
  }
}

/** Las acciones que la App enseña, en el orden que las da la API. */
export function toPointActions(rows: PointActionOut[]): PointAction[] {
  return rows
    .map(toPointAction)
    .filter((action): action is PointAction => action !== null)
}

/** Marca completadas las acciones con movimiento positivo en el ledger. */
export function withCompletedActions(
  actions: PointAction[],
  ledger: ReadonlyArray<{ type: string; points: number }>
): PointAction[] {
  const earnedByType = new Map<string, number>()
  for (const item of ledger) {
    if (item.points <= 0) continue
    earnedByType.set(
      item.type,
      (earnedByType.get(item.type) ?? 0) + item.points
    )
  }
  return actions.map((action) => {
    const matches = ACTION_TYPE_TO_LEDGER[action.apiType] ?? [action.apiType]
    const earned = matches.reduce(
      (sum, type) => sum + (earnedByType.get(type) ?? 0),
      0
    )
    return {
      ...action,
      completed: earned > 0,
      earnedPoints: earned > 0 ? earned : undefined,
    }
  })
}
