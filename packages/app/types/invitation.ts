/**
 * Tipos del seguimiento de invitaciones («Les meves invitacions»).
 *
 * Cada registro representa un ALTA ATRIBUIBLE (una persona o un negocio que
 * ha llegado desde una invitación), nunca un mensaje enviado: abrir WhatsApp,
 * copiar un enlace o abrir el correo no permite saber quién lo recibió.
 *
 * DATOS QUE NECESITA EL BACKEND cuando se conecte:
 *  - id: identificador del registro atribuido.
 *  - kind: "person" | "business".
 *  - status: "started" solo si existe un evento que lo acredite.
 *  - displayName: nombre comercial del negocio, o nombre reducido de la
 *    persona SOLO si está autorizado. Nunca correo, teléfono ni actividad.
 *  - startedAt / completedAt / grantedAt: ISO 8601, opcionales; se omiten si
 *    el hito no existe (no se inventan cronologías).
 *  - points: recompensa asociada al registro.
 */
export type InvitationKind = 'person' | 'business'

/**
 * started  → registro iniciado (solo si hay evento que lo acredite)
 * pending  → registro completado, recompensa procesándose
 * granted  → registro completado y recompensa abonada
 */
export type InvitationStatus = 'started' | 'pending' | 'granted'

export interface InvitationRecord {
  id: string
  kind: InvitationKind
  status: InvitationStatus
  /** Nombre comercial (negocios) o nombre reducido autorizado (personas). */
  displayName: string | null
  startedAt: string | null
  completedAt: string | null
  grantedAt: string | null
  points: number
}

export interface InvitationsSummary {
  personsRegistered: number
  businessesRegistered: number
  /** Solo puntos ya abonados: los pendientes no forman parte del saldo. */
  pointsEarned: number
  pointsPending: number
}
