export type LegalDocumentId = 'conditions' | 'privacy'

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface LegalSection {
  title: string
  anchor?: string
  blocks: LegalBlock[]
}

export interface LegalDocumentContent {
  version: string
  introduction: string[]
  sections: LegalSection[]
}
