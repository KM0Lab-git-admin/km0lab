/**
 * Textos legales: condiciones del piloto y política de privacidad.
 *
 * Los textos los escribe Legal y viven en ficheros de contenido por idioma
 * (`apps/km0lab/src/content/legal/*.md`), copiados tal cual. Aquí está solo
 * lo justo para pintarlos: un lector del poco formato que usan (títulos,
 * párrafos, listas, tablas, negrita, cursiva y enlaces). No es un Markdown
 * completo a propósito: lo que no reconoce sale como texto, nunca como HTML.
 */

/** Versión vigente de condiciones y política. Subirla hace que todos vuelvan a aceptar. */
export const TERMS_VERSION = '1'

export type LegalBlock =
  | { type: 'heading'; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }

export type LegalInline =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'link'; text: string; href: string }

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

const isTableRule = (line: string) => /^\|?[\s:|-]+\|?$/.test(line.trim())

/** Convierte el texto de Legal en bloques para pintar. */
export function parseLegalText(source: string): LegalBlock[] {
  const blocks: LegalBlock[] = []
  let paragraph: string[] = []
  let list: string[] | null = null
  let table: { head: string[]; rows: string[][] } | null = null

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
    if (list) {
      blocks.push({ type: 'list', items: list })
      list = null
    }
    if (table) {
      blocks.push({ type: 'table', ...table })
      table = null
    }
  }

  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    const text = line.trim()

    if (text === '' || text === '---') {
      flush()
      continue
    }

    const heading = /^#{2,4}\s+(.*)$/.exec(text)
    if (heading) {
      flush()
      const anchored = /^(.*?)\s*\{#([a-z0-9-]+)\}\s*$/i.exec(heading[1] ?? '')
      blocks.push(
        anchored
          ? { type: 'heading', text: anchored[1] ?? '', id: anchored[2] }
          : { type: 'heading', text: heading[1] ?? '' }
      )
      continue
    }

    if (text.startsWith('|')) {
      if (paragraph.length > 0 || list) flush()
      if (!table) table = { head: cells(text), rows: [] }
      else if (!isTableRule(text)) table.rows.push(cells(text))
      continue
    }

    const item = /^[-*]\s+(.*)$/.exec(text)
    if (item) {
      if (paragraph.length > 0 || table) flush()
      list = [...(list ?? []), item[1] ?? '']
      continue
    }

    // Una línea con sangría tras un elemento de lista es su continuación.
    if (list && /^\s+\S/.test(line)) {
      list[list.length - 1] = `${list[list.length - 1]} ${text}`
      continue
    }

    if (list || table) flush()
    paragraph.push(text)
  }
  flush()
  return blocks
}

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*]+)\*/g

/** Parte una línea en trozos de texto, negrita, cursiva y enlaces. */
export function parseLegalInline(text: string): LegalInline[] {
  const out: LegalInline[] = []
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0
    if (at > last) out.push({ type: 'text', text: text.slice(last, at) })
    if (match[1] !== undefined) out.push({ type: 'bold', text: match[1] })
    else if (match[2] !== undefined && match[3] !== undefined) {
      out.push({ type: 'link', text: match[2], href: match[3] })
    } else if (match[4] !== undefined) {
      out.push({ type: 'italic', text: match[4] })
    }
    last = at + match[0].length
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) })
  return out
}
