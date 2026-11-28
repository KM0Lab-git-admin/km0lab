/**
 * Las páginas legales del prototipo (encargo 16) con el texto de Legal: la
 * versión arriba, la introducción, los apartados con su ancla y las tablas
 * como filas para pintar en tarjetas.
 */
import { describe, expect, it } from 'vitest'

import {
  legalDocumentFromText,
  loadLegalDocument,
} from '../hooks/use-legal-document'

describe('el texto de Legal con la forma de la página', () => {
  it('versión, introducción, apartados, listas y tablas', () => {
    const doc = legalDocumentFromText(
      [
        '**Versió 2 · 28 de novembre de 2026**',
        '',
        'Intro una.',
        '',
        'Intro dos.',
        '',
        '### 1. El pilot',
        '',
        '- Cal tenir **14 anys** o més.',
        '',
        '### Per a comerços {#comercos}',
        '',
        '| Proveïdor | On |',
        '|---|---|',
        '| Railway | EUA |',
      ].join('\n')
    )
    expect(doc.version).toBe('**Versió 2 · 28 de novembre de 2026**')
    expect(doc.introduction).toEqual(['Intro una.', 'Intro dos.'])
    expect(doc.sections).toEqual([
      {
        title: '1. El pilot',
        blocks: [{ type: 'list', items: ['Cal tenir **14 anys** o més.'] }],
      },
      {
        title: 'Per a comerços',
        anchor: 'comercos',
        blocks: [
          {
            type: 'table',
            headers: ['Proveïdor', 'On'],
            rows: [['Railway', 'EUA']],
          },
        ],
      },
    ])
  })

  it.each(['ca', 'es', 'en'] as const)(
    'los ficheros de Legal en %s: versión 2, ancla de comercios y dos tablas',
    async (lang) => {
      const conditions = await loadLegalDocument('conditions', lang)
      expect(conditions.version).toMatch(/2/)
      expect(conditions.sections.some((s) => s.anchor === 'comercos')).toBe(
        true
      )
      const privacy = await loadLegalDocument('privacy', lang)
      const tables = privacy.sections.flatMap((s) =>
        s.blocks.filter((b) => b.type === 'table')
      )
      expect(tables).toHaveLength(2)
    }
  )
})
