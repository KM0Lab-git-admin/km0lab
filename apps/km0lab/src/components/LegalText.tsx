import {
  parseLegalInline,
  parseLegalText,
  type LegalBlock,
  type LegalInline,
} from '@km0lab/app'
import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'

/*
 * De producción (candado en el manifest): pinta los textos de Legal
 * (`src/content/legal`) y los avisos con enlaces del alta. Los textos no
 * están aquí: llegan como contenido.
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
      // Las rutas de la App se abren dentro; lo demás, en otra pestaña.
      return piece.href.startsWith('/') ? (
        <Link key={key} to={piece.href} className={linkClass}>
          {piece.text}
        </Link>
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

const renderBlock = (block: LegalBlock, key: number) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2
          key={key}
          id={block.id}
          className="mt-6 scroll-mt-4 font-brand text-lg text-km0-blue-800"
        >
          {block.text}
        </h2>
      )
    case 'list':
      return (
        <ul key={key} className="ml-5 list-disc space-y-1.5">
          {block.items.map((item, index) => (
            <li key={index}>
              <LegalLine text={item} />
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div key={key} className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-xs">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th
                    key={index}
                    className="border border-km0-beige-200 bg-km0-beige-100 px-2 py-1.5 font-ui font-semibold text-km0-blue-800"
                  >
                    <LegalLine text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className="border border-km0-beige-200 px-2 py-1.5 align-top"
                    >
                      <LegalLine text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return (
        <p key={key}>
          <LegalLine text={block.text} />
        </p>
      )
  }
}

const LegalText = ({ source }: { source: string }) => {
  const blocks = useMemo(() => parseLegalText(source), [source])
  return (
    <div className="space-y-3 font-body text-sm leading-relaxed text-foreground">
      {blocks.map(renderBlock)}
    </div>
  )
}

export default LegalText
