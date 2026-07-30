/**
 * Utilidades para shops.opening_hours (JSON semanal de km0lab-api).
 */
import type { DayHoursOut, OpeningHoursOut } from '../services/km0labClient'
import type { Lang } from './i18n'
import { t, type TKey } from './i18n'

export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number]

const DAY_LABEL_KEY: Record<WeekdayKey, TKey> = {
  monday: 'merchant.day.monday',
  tuesday: 'merchant.day.tuesday',
  wednesday: 'merchant.day.wednesday',
  thursday: 'merchant.day.thursday',
  friday: 'merchant.day.friday',
  saturday: 'merchant.day.saturday',
  sunday: 'merchant.day.sunday',
}

/** JS getDay(): 0=domingo … 6=sábado → clave API. */
export function weekdayKeyFromDate(d = new Date()): WeekdayKey {
  const map: WeekdayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return map[d.getDay()]!
}

const toMinutes = (hhmm: string): number | null => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim())
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

const inRange = (
  now: number,
  opens?: string | null,
  closes?: string | null
) => {
  if (!opens || !closes) return false
  const a = toMinutes(opens)
  const b = toMinutes(closes)
  if (a === null || b === null) return false
  if (b >= a) return now >= a && now < b
  // Cruce de medianoche
  return now >= a || now < b
}

/** Formatea un día: "07:00–14:00" | "07:00–14:00 · 17:00–20:00" | cerrado. */
export function formatDayHours(
  day: DayHoursOut | undefined,
  lang: Lang,
  closedLabel?: string
): string {
  const closed = closedLabel ?? t('merchant.hours.closed', lang)
  if (!day || day.closed || !day.opens || !day.closes) return closed
  const primary = `${day.opens}–${day.closes}`
  if (day.opens_2 && day.closes_2) {
    return `${primary} · ${day.opens_2}–${day.closes_2}`
  }
  return primary
}

export function dayLabel(key: WeekdayKey, lang: Lang): string {
  return t(DAY_LABEL_KEY[key], lang)
}

export function isOpenNow(
  hours: OpeningHoursOut | null | undefined,
  now = new Date()
): boolean {
  if (!hours) return false
  const day = hours[weekdayKeyFromDate(now)]
  if (!day || day.closed) return false
  const mins = now.getHours() * 60 + now.getMinutes()
  return (
    inRange(mins, day.opens, day.closes) ||
    inRange(mins, day.opens_2, day.closes_2)
  )
}

/** Hora de cierre del tramo activo (o del último tramo del día). */
export function closesAtToday(
  hours: OpeningHoursOut | null | undefined,
  now = new Date()
): string | undefined {
  if (!hours) return undefined
  const day = hours[weekdayKeyFromDate(now)]
  if (!day || day.closed) return undefined
  const mins = now.getHours() * 60 + now.getMinutes()
  if (inRange(mins, day.opens, day.closes)) return day.closes ?? undefined
  if (inRange(mins, day.opens_2, day.closes_2)) return day.closes_2 ?? undefined
  return day.closes_2 || day.closes || undefined
}

export function todayHoursLabel(
  hours: OpeningHoursOut | null | undefined,
  lang: Lang
): string {
  if (!hours) return t('merchant.hours.closed', lang)
  return formatDayHours(hours[weekdayKeyFromDate()], lang)
}

export interface WeekHoursRow {
  key: WeekdayKey
  label: string
  value: string
  isToday: boolean
}

export function weekHoursRows(
  hours: OpeningHoursOut,
  lang: Lang,
  now = new Date()
): WeekHoursRow[] {
  const today = weekdayKeyFromDate(now)
  return WEEKDAY_KEYS.map((key) => ({
    key,
    label: dayLabel(key, lang),
    value: formatDayHours(hours[key], lang),
    isToday: key === today,
  }))
}

/** Normaliza nombre de shop a slug comparable con rutas mock/API. */
export function shopNameToSlug(name: string): string {
  return name
    .replace(/^\[DEMO\]\s*/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
