import { parseLegalInline, type LegalInline } from '@km0lab/app'
import { Fragment } from 'react'

import LegalLink from '@/components/LegalLink'

/*
 * De producción (candado en el manifest): las líneas con enlaces de Legal en
 * los avisos del alta («Antes de continuar»). Los textos no están aquí: llegan
 * de i18n. Las páginas legales enteras las pinta `LegalDocument`, del
 * prototipo.
 */

const linkClass =
  'font-semibold text-km0-blue-700 underline underline-offset-2 hover:text-km0-blue-600'

const renderPiece = (piece: LegalInline, key: number) => {
  switch (piece.type) {
    case 'bold':
      return <strong key={key}>{piece.text}</strong>
    case 'italic':
      return <em key={key}>{piece.text}</em>
    case 'link':
      // Las rutas de la App se abren encima, sin perder lo de debajo; lo
      // demás, en otra pestaña.
      return piece.href.startsWith('/') ? (
        <LegalLink key={key} to={piece.href} className={linkClass}>
          {piece.text}
        </LegalLink>
      ) : (
        <a
          key={key}
          href={piece.href}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {piece.text}
        </a>
      )
    default:
      return <Fragment key={key}>{piece.text}</Fragment>
  }
}

/** Una línea con negritas, cursivas y enlaces (`[texto](/ruta)`). */
export const LegalLine = ({ text }: { text: string }) => (
  <>{parseLegalInline(text).map(renderPiece)}</>
)
