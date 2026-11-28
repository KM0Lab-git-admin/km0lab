interface LegalRichTextProps {
  text: string
}

/** Renders only the bold markers present in the approved legal source. */
const LegalRichText = ({ text }: LegalRichTextProps) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      )
    )}
  </>
)

export default LegalRichText
