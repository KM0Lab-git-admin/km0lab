import type { LegalBlock, LegalDocumentContent } from '@km0lab/app'

import LegalPlatformNotice from '@/components/LegalPlatformNotice'
import LegalRichText from '@/components/LegalRichText'

interface LegalDocumentViewProps {
  content: LegalDocumentContent
  showPlatformNotice?: boolean
}

const LegalBlockView = ({ block }: { block: LegalBlock }) => {
  if (block.type === 'list')
    return (
      <ul className="list-disc space-y-2 pl-5 marker:text-km0-blue-700">
        {block.items.map((item, index) => (
          <li
            key={index}
            className="pl-1 font-body text-sm leading-7 text-km0-blue-800"
          >
            <LegalRichText text={item} />
          </li>
        ))}
      </ul>
    )
  if (block.type === 'table')
    return (
      <ul className="space-y-3">
        {block.rows.map((row, rowIndex) => (
          <li
            key={rowIndex}
            className="rounded-2xl border border-km0-blue-100 bg-card p-4 shadow-[var(--shadow-bubble)]"
          >
            <dl className="space-y-3">
              {block.headers.map((header, columnIndex) => (
                <div key={header}>
                  <dt className="font-ui text-xs font-bold uppercase leading-5 tracking-wide text-km0-blue-700">
                    {header}
                  </dt>
                  <dd className="mt-0.5 font-body text-sm leading-6 text-km0-blue-800">
                    <LegalRichText text={row[columnIndex] ?? ''} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    )
  return (
    <p className="font-body text-sm leading-7 text-km0-blue-800">
      <LegalRichText text={block.text} />
    </p>
  )
}

const LegalDocumentView = ({
  content,
  showPlatformNotice = false,
}: LegalDocumentViewProps) => (
  <article className="px-5 py-6">
    <p className="font-body text-sm leading-6 text-km0-blue-800/70">
      <LegalRichText text={content.version} />
    </p>
    <div className="mt-4 space-y-4">
      {content.introduction.map((paragraph, index) => (
        <p
          key={index}
          className="font-body text-sm leading-7 text-km0-blue-800"
        >
          <LegalRichText text={paragraph} />
        </p>
      ))}
    </div>
    <div className="mt-8 space-y-8">
      {content.sections.map((section) => (
        <section
          key={section.title}
          aria-labelledby={section.anchor ? section.anchor : undefined}
        >
          <h2
            id={section.anchor}
            className="scroll-mt-4 font-brand text-xl font-black leading-7 text-km0-blue-900"
          >
            {section.title}
          </h2>
          <div className="mt-3 space-y-4">
            {section.blocks.map((block, index) => (
              <LegalBlockView key={index} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
    {showPlatformNotice && <LegalPlatformNotice />}
  </article>
)

export default LegalDocumentView
