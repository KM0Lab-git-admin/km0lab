/**
 * GreetingBlock — saludo personalizado.
 * `greeting` ya viene localizado y compuesto desde el caller (Home).
 */
export interface GreetingBlockProps {
  greeting: string
  subtitle: string
}

const GreetingBlock = ({ greeting, subtitle }: GreetingBlockProps) => {
  return (
    <div className="w-full gap-0.5 flex-row px-[4px] py-[4px] flex items-center justify-start">
      {greeting && (
        <h2 className="font-brand font-black text-km0-blue-700 text-xl flex items-center gap-2 leading-tight">
          <span>{greeting}</span>
        </h2>
      )}
      <p className="font-body text-foreground text-sm flex items-center gap-1.5 leading-snug">
        {subtitle}
      </p>
    </div>
  )
}

export default GreetingBlock
