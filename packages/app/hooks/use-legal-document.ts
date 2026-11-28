import { useEffect, useState } from 'react'

import { useAppStore } from '../stores/useAppStore'
import { parseLegalText } from '../utils/legalText'

import type {
  LegalBlock,
  LegalDocumentContent,
  LegalDocumentId,
  LegalSection,
} from '../types/legal'
import type { Lang } from '../utils/i18n'

/*
 * De producción (candado en el manifest). El prototipo guarda una copia del
 * texto en sus datos; aquí el texto es el de Legal, un fichero por documento
 * e idioma en `content/legal`, copiado tal cual. Cada uno se descarga solo
 * cuando se abre su página.
 */
const FILES = import.meta.glob<string>('../content/legal/*.md', {
  query: '?raw',
  import: 'default',
})

const FILE_NAME: Record<LegalDocumentId, string> = {
  conditions: 'condicions',
  privacy: 'privacitat',
}

/**
 * El texto de Legal con la forma que pinta la página: la primera línea es la
 * versión, lo que va antes del primer título es la introducción, y cada
 * título abre un apartado (con su ancla si la lleva, como `#comercos`).
 */
export const legalDocumentFromText = (source: string): LegalDocumentContent => {
  const content: LegalDocumentContent = {
    version: '',
    introduction: [],
    sections: [],
  }
  let section: LegalSection | null = null
  for (const block of parseLegalText(source)) {
    if (block.type === 'heading') {
      section = { title: block.text, blocks: [] }
      if (block.id) section.anchor = block.id
      content.sections.push(section)
      continue
    }
    if (!section) {
      if (block.type !== 'paragraph') continue
      if (!content.version) content.version = block.text
      else content.introduction.push(block.text)
      continue
    }
    const shown: LegalBlock =
      block.type === 'table'
        ? { type: 'table', headers: block.head, rows: block.rows }
        : block
    section.blocks.push(shown)
  }
  return content
}

export const loadLegalDocument = async (
  id: LegalDocumentId,
  lang: Lang
): Promise<LegalDocumentContent> => {
  const load = FILES[`../content/legal/${FILE_NAME[id]}.${lang}.md`]
  if (!load) throw new Error('legal_document_unavailable')
  return legalDocumentFromText(await load())
}

/** Condiciones o política, en el idioma de la App. */
export const useLegalDocument = (id: LegalDocumentId) => {
  const lang = useAppStore((s) => s.lang)
  const [revision, setRevision] = useState(0)
  const [document, setDocument] = useState<LegalDocumentContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setDocument(null)
    setError(null)
    setLoading(true)
    loadLegalDocument(id, lang)
      .then((result) => {
        if (!active) return
        setDocument(result)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError('legal_document_unavailable')
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, lang, revision])

  return {
    document,
    loading,
    error,
    reload: () => setRevision((value) => value + 1),
  }
}
