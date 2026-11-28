import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { t } from '../utils/i18nProd'
import {
  parseLegalInline,
  parseLegalText,
  TERMS_VERSION,
} from '../utils/legalText'

describe('textos legales', () => {
  it('títulos, párrafos de varias líneas y listas con continuación', () => {
    const blocks = parseLegalText(
      [
        '**Versió 1 · 27 de novembre de 2026**',
        '',
        'KM0 LAB organitza a la teva població',
        'un programa pilot.',
        '',
        '### 1. El pilot',
        '',
        '- Comença quan hi ha almenys **10 comerços** adherits i dura',
        '  **60 dies**.',
        '- Participar és gratuït.',
      ].join('\n')
    )

    expect(blocks).toEqual([
      { type: 'paragraph', text: '**Versió 1 · 27 de novembre de 2026**' },
      {
        type: 'paragraph',
        text: 'KM0 LAB organitza a la teva població un programa pilot.',
      },
      { type: 'heading', text: '1. El pilot' },
      {
        type: 'list',
        items: [
          'Comença quan hi ha almenys **10 comerços** adherits i dura **60 dies**.',
          'Participar és gratuït.',
        ],
      },
    ])
  })

  it('el apartado de comercios lleva su ancla, para enlazarlo desde el alta', () => {
    expect(parseLegalText('### Per a comerços {#comercos}')).toEqual([
      { type: 'heading', text: 'Per a comerços', id: 'comercos' },
    ])
  })

  it('una negrita seguida de lista son dos bloques', () => {
    expect(
      parseLegalText('**Si registres un comerç**\n- Dades del negoci.')
    ).toEqual([
      { type: 'paragraph', text: '**Si registres un comerç**' },
      { type: 'list', items: ['Dades del negoci.'] },
    ])
  })

  it('las tablas: cabecera y filas, sin la línea de guiones', () => {
    const [table, after] = parseLegalText(
      [
        '| Per a què | Dades |',
        '|---|---|',
        '| Crear el teu compte | Compte, correu |',
        '| Punts d’aniversari | Data de naixement |',
        '',
        'No prenem decisions automàtiques.',
      ].join('\n')
    )

    expect(table).toEqual({
      type: 'table',
      head: ['Per a què', 'Dades'],
      rows: [
        ['Crear el teu compte', 'Compte, correu'],
        ['Punts d’aniversari', 'Data de naixement'],
      ],
    })
    expect(after).toEqual({
      type: 'paragraph',
      text: 'No prenem decisions automàtiques.',
    })
  })

  it('los separadores entre apartados no pintan nada', () => {
    expect(parseLegalText('Un.\n\n---\n\nDos.')).toHaveLength(2)
  })
})

describe('negritas, cursivas y enlaces dentro de una línea', () => {
  it('la casilla del alta enlaza a las condiciones', () => {
    expect(parseLegalInline(t('legal.accept.label', 'ca'))).toEqual([
      { type: 'text', text: 'Accepto les ' },
      { type: 'link', text: 'condicions del pilot', href: '/condicions' },
      { type: 'text', text: '.' },
    ])
  })

  it('negrita y cursiva', () => {
    expect(parseLegalInline('Cal **14 anys** i *res més*')).toEqual([
      { type: 'text', text: 'Cal ' },
      { type: 'bold', text: '14 anys' },
      { type: 'text', text: ' i ' },
      { type: 'italic', text: 'res més' },
    ])
  })

  it('lo que no es formato sale tal cual, nunca como HTML', () => {
    expect(parseLegalInline('<b>hola</b> 2 * 3')).toEqual([
      { type: 'text', text: '<b>hola</b> 2 * 3' },
    ])
  })
})

it('la versión de las condiciones que acepta el vecino', () => {
  expect(TERMS_VERSION).toBe('2')
})

it('la casilla no habla de la edad, en ningún idioma', () => {
  // Albert no la quiere ahí («parece una página para adultos») y Legal lo
  // respalda: los 14 años están en las condiciones, enlazadas en la casilla.
  for (const lang of ['ca', 'es', 'en'] as const) {
    const label = t('legal.accept.label', lang)
    expect(label).not.toMatch(/\d/)
    expect(label).toContain('](/condicions)')
  }
})

describe('los textos de Legal que publica la App', () => {
  const dir = resolve(__dirname, '../content/legal')
  const docs = ['condicions', 'privacitat'] as const
  const langs = ['ca', 'es', 'en'] as const

  it.each(docs.flatMap((doc) => langs.map((lang) => [doc, lang] as const)))(
    '%s en %s se lee entero, sin restos de formato',
    (doc, lang) => {
      const blocks = parseLegalText(
        readFileSync(resolve(dir, `${doc}.${lang}.md`), 'utf8')
      )
      expect(blocks.length).toBeGreaterThan(20)
      for (const block of blocks) {
        const texts =
          block.type === 'list'
            ? block.items
            : block.type === 'table'
              ? [...block.head, ...block.rows.flat()]
              : [block.text]
        for (const text of texts) {
          expect(text).not.toMatch(/^\s*(#|\||- )/)
          expect(text).not.toContain('{#')
        }
      }
      // Las condiciones llevan el ancla del apartado de comercios; la
      // política, sus tablas.
      if (doc === 'condicions') {
        expect(
          blocks.some((b) => b.type === 'heading' && b.id === 'comercos')
        ).toBe(true)
      } else {
        expect(blocks.filter((b) => b.type === 'table').length).toBe(2)
      }
    }
  )
})
