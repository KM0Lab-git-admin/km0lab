import { cn } from "@/lib/utils";

interface LanguageCardProps {
  flag: string;
  flagIsImage?: boolean;
  name: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const LanguageCard = ({
  flag,
  flagIsImage = false,
  name,
  description,
  selected = false,
  disabled = false,
  onClick,
  style
}: LanguageCardProps) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left group border-[2px] border-solid",
        "transition-all duration-300 ease-out animate-fade-in-up",
        disabled
          ? "bg-neutral-100 border-neutral-300 cursor-not-allowed"
          : cn(
              "bg-card cursor-pointer",
              "hover:scale-[1.09] hover:-translate-y-3 hover:shadow-[0_24px_56px_-8px_hsl(var(--km0-blue-700)/0.4)] hover:border-km0-yellow-500 hover:bg-km0-yellow-50",
              selected
                ? "border-km0-yellow-500 bg-km0-yellow-50 scale-[1.04] -translate-y-1.5 shadow-[0_16px_40px_-8px_hsl(var(--km0-blue-700)/0.25)]"
                : "border-km0-blue-700 shadow-[0_8px_24px_-12px_hsl(var(--km0-blue-700)/0.35)]"
            )
      )}>

      {/* Flag */}
      <span
        className={cn(
          "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full overflow-hidden transition-all duration-300",
          disabled
            ? "bg-neutral-200 grayscale"
            : cn(
                "bg-km0-beige-50 group-hover:bg-km0-yellow-100 group-hover:scale-110",
                selected ? "bg-km0-yellow-100 scale-110" : ""
              )
        )}
        role="img"
        aria-label={name}>

        {flagIsImage
          ? <img src={flag} alt={`${name} flag`} className="w-9 h-9 object-cover rounded-full" />
          : <span className="text-3xl">{flag}</span>
        }
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-ui font-semibold text-lg leading-tight", disabled ? "text-neutral-500" : "text-primary")}>
          {name}
        </p>
        <p className={cn("font-body text-sm mt-0.5", disabled ? "text-neutral-500" : "text-muted-foreground")}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      <span
        className={cn(
          "text-xl flex-shrink-0 transition-all duration-300",
          disabled
            ? "text-neutral-500"
            : cn(
                "group-hover:text-km0-yellow-500 group-hover:translate-x-2 group-hover:scale-125",
                selected ? "text-km0-yellow-500 translate-x-1" : "text-km0-blue-300"
              )
        )}>
        →
      </span>
    </button>
  );
};

export default LanguageCard;
