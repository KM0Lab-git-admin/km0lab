/**
 * KM0 LAB Design System — Source of truth for tokens.
 * Mirrors src/index.css and tailwind.config.ts.
 * Used by /design-system UI AND by the AI context exporter.
 */

export type ColorScale = {
  name: string;
  description: string;
  principal: number; // shade considered "main"
  shades: { shade: number; hsl: string; hex: string; usage?: string }[];
};

export const colorScales: ColorScale[] = [
  {
    name: "km0-blue",
    description: "Color institucional. Identidad principal de marca, headers y CTAs primarios.",
    principal: 700,
    shades: [
      { shade: 50,  hsl: "214 69% 97%", hex: "#F0F4FD", usage: "fondos sutiles, hover de superficies claras" },
      { shade: 100, hsl: "228 60% 91%", hex: "#DADEF8" },
      { shade: 200, hsl: "222 64% 82%", hex: "#B5C3F0" },
      { shade: 300, hsl: "218 60% 73%", hex: "#90A9E8" },
      { shade: 400, hsl: "214 49% 62%", hex: "#6B8FD0" },
      { shade: 500, hsl: "215 43% 49%", hex: "#4674B8" },
      { shade: 600, hsl: "217 56% 40%", hex: "#2B5AA0", usage: "hover del CTA primario" },
      { shade: 700, hsl: "220 73% 33%", hex: "#174094", usage: "PRINCIPAL — primary, ring, bordes de marca, títulos H1" },
      { shade: 800, hsl: "214 61% 19%", hex: "#132A50", usage: "foreground principal sobre beige" },
      { shade: 900, hsl: "214 63% 15%", hex: "#0F2040", usage: "background dark mode" },
    ],
  },
  {
    name: "km0-beige",
    description: "Fondos cálidos del producto. Secondary y superficies de la card.",
    principal: 100,
    shades: [
      { shade: 50,  hsl: "36 100% 97%", hex: "#FFF9F0", usage: "background global / muted" },
      { shade: 100, hsl: "33 100% 90%", hex: "#FFECD2", usage: "PRINCIPAL — secondary, gradiente de la card" },
      { shade: 200, hsl: "51 96% 83%",  hex: "#FDEEA9", usage: "border / input border por defecto" },
      { shade: 300, hsl: "47 93% 73%",  hex: "#FBDB7E" },
      { shade: 400, hsl: "44 90% 64%",  hex: "#F9C853" },
      { shade: 500, hsl: "41 92% 56%",  hex: "#F7B528" },
      { shade: 600, hsl: "39 73% 49%",  hex: "#DCA223" },
      { shade: 700, hsl: "38 72% 43%",  hex: "#C18F1E" },
      { shade: 800, hsl: "37 72% 37%",  hex: "#A67C19" },
      { shade: 900, hsl: "36 72% 31%",  hex: "#8B6914" },
    ],
  },
  {
    name: "km0-yellow",
    description: "Color de atención y back navigation. Usado en bordes punteados y elementos secundarios destacados.",
    principal: 500,
    shades: [
      { shade: 50,  hsl: "44 100% 97%", hex: "#FEFAF0", usage: "hover del back button" },
      { shade: 100, hsl: "45 95% 93%",  hex: "#FDF5DA" },
      { shade: 200, hsl: "44 91% 84%",  hex: "#FBE9B4" },
      { shade: 300, hsl: "44 91% 76%",  hex: "#F9DD8E" },
      { shade: 400, hsl: "43 91% 69%",  hex: "#F7D168" },
      { shade: 500, hsl: "43 89% 61%",  hex: "#F5C542", usage: "PRINCIPAL — borde back button" },
      { shade: 600, hsl: "39 73% 49%",  hex: "#DCA223", usage: "icono back button" },
      { shade: 700, hsl: "38 72% 43%",  hex: "#C18F1E" },
      { shade: 800, hsl: "37 72% 37%",  hex: "#A67C19" },
      { shade: 900, hsl: "36 72% 31%",  hex: "#8B6914" },
    ],
  },
  {
    name: "km0-teal",
    description: "Acento interactivo. Iconos activos, focus de inputs, confirmaciones positivas.",
    principal: 500,
    shades: [
      { shade: 50,  hsl: "178 100% 97%", hex: "#F0FFFE" },
      { shade: 100, hsl: "178 100% 90%", hex: "#CCFAF8" },
      { shade: 200, hsl: "177 80% 73%",  hex: "#80EAE4" },
      { shade: 300, hsl: "177 72% 57%",  hex: "#40D9D0" },
      { shade: 400, hsl: "177 100% 42%", hex: "#00C7BC", usage: "focus border de inputs" },
      { shade: 500, hsl: "177 100% 36%", hex: "#00B8A9", usage: "PRINCIPAL — accent, iconos activos" },
      { shade: 600, hsl: "177 100% 30%", hex: "#009A8E", usage: "texto confirmación (ej: ciudad encontrada)" },
      { shade: 700, hsl: "177 100% 24%", hex: "#007C72" },
      { shade: 800, hsl: "177 100% 18%", hex: "#005E56" },
      { shade: 900, hsl: "177 100% 13%", hex: "#00403B" },
    ],
  },
  {
    name: "km0-coral",
    description: "Color de error y alerta. Destructive token. Usar SOLO para validación negativa o destrucciones.",
    principal: 400,
    shades: [
      { shade: 50,  hsl: "5 100% 93%",  hex: "#FFE0DB" },
      { shade: 100, hsl: "5 100% 86%",  hex: "#FFC2B7" },
      { shade: 200, hsl: "5 100% 79%",  hex: "#FFA394" },
      { shade: 300, hsl: "5 100% 72%",  hex: "#FF8570" },
      { shade: 400, hsl: "7 100% 65%",  hex: "#FF664D", usage: "PRINCIPAL — destructive (errores, no encontrado)" },
      { shade: 500, hsl: "13 100% 48%", hex: "#F73200", usage: "destructive en dark mode" },
      { shade: 600, hsl: "13 100% 43%", hex: "#DC2C00" },
      { shade: 700, hsl: "13 100% 38%", hex: "#C12600" },
      { shade: 800, hsl: "13 100% 32%", hex: "#A62000" },
      { shade: 900, hsl: "13 100% 27%", hex: "#8B1A00" },
    ],
  },
];

/* ─── Semantic shadcn-style tokens ────────────────────── */
export type SemanticToken = {
  name: string;
  mapsTo: string;
  description: string;
  example?: string;
};

export const semanticTokens: SemanticToken[] = [
  { name: "background",            mapsTo: "km0-beige-50",       description: "Fondo global de la app." },
  { name: "foreground",            mapsTo: "km0-blue-800",       description: "Color de texto por defecto sobre background." },
  { name: "card",                  mapsTo: "white",              description: "Superficie de tarjetas (inputs, popovers)." },
  { name: "primary",               mapsTo: "km0-blue-700",       description: "CTA principal, foco, énfasis máximo.", example: "bg-primary text-primary-foreground" },
  { name: "primary-foreground",    mapsTo: "white",              description: "Texto sobre primary." },
  { name: "secondary",             mapsTo: "km0-beige-100",      description: "Superficies cálidas secundarias." },
  { name: "muted",                 mapsTo: "km0-beige-50",       description: "Fondos sutiles, separadores blandos." },
  { name: "muted-foreground",      mapsTo: "hsl(220 9% 46%)",    description: "Texto secundario / placeholder visible." },
  { name: "accent",                mapsTo: "km0-teal-500",       description: "Acento interactivo (iconos, hovers de elementos teal)." },
  { name: "destructive",           mapsTo: "km0-coral-400",      description: "Errores, validación negativa, acciones destructivas." },
  { name: "destructive-foreground", mapsTo: "white",             description: "Texto sobre destructive." },
  { name: "border",                mapsTo: "km0-beige-200",      description: "Bordes neutros por defecto." },
  { name: "input",                 mapsTo: "km0-beige-200",      description: "Borde de campos de formulario." },
  { name: "ring",                  mapsTo: "km0-blue-700",       description: "Anillo de focus accesible." },
  { name: "radius",                mapsTo: "0.75rem",            description: "Radio base; rounded-2xl/3xl son los más usados." },
];

/* ─── Typography ──────────────────────────────────────── */
export type TypographyEntry = {
  className: string;
  family: string;
  weight: number;
  usage: string;
  sample: string;
};

export const typography: TypographyEntry[] = [
  {
    className: "font-brand",
    family: "Antique Olive",
    weight: 900,
    usage: "Títulos H1 de pantalla, branding (logo). NUNCA añadir font-bold encima.",
    sample: "INTRODUCE TU CÓDIGO POSTAL",
  },
  {
    className: "font-ui",
    family: "Inter",
    weight: 400,
    usage: "Texto de UI: labels, botones, inputs. Permite font-semibold/medium.",
    sample: "CONTINUAR",
  },
  {
    className: "font-body",
    family: "DM Sans (fallback Inter)",
    weight: 400,
    usage: "Párrafos, subtítulos descriptivos, copy largo.",
    sample: "Descubre comercios y servicios en tu barrio",
  },
];

export const typeScale = [
  { className: "text-xs",   px: 12, lineHeight: 16, usage: "captions, errores en landscape" },
  { className: "text-sm",   px: 14, lineHeight: 20, usage: "subtítulos, copy de soporte, CTAs" },
  { className: "text-base", px: 16, lineHeight: 24, usage: "body por defecto" },
  { className: "text-lg",   px: 18, lineHeight: 28, usage: "input grande" },
  { className: "text-xl",   px: 20, lineHeight: 28, usage: "H1 confirmación (ciudad)" },
  { className: "text-2xl",  px: 24, lineHeight: 32, usage: "H1 principal en portrait" },
  { className: "text-3xl",  px: 30, lineHeight: 36, usage: "H1 grande en horizontal-desktop" },
];

/* ─── Spacing ─────────────────────────────────────────── */
export const spacingScale = [
  { token: "1",  px: 4 },
  { token: "2",  px: 8 },
  { token: "3",  px: 12 },
  { token: "4",  px: 16 },
  { token: "5",  px: 20 },
  { token: "6",  px: 24, usage: "gap principal entre bloques en portrait" },
  { token: "7",  px: 28, usage: "gap en vertical-mobile (más aire)" },
  { token: "8",  px: 32 },
  { token: "12", px: 48 },
];

/* ─── Radius ──────────────────────────────────────────── */
export const radiusScale = [
  { className: "rounded-md",  px: 6,  usage: "elementos pequeños internos" },
  { className: "rounded-lg",  px: 8 },
  { className: "rounded-xl",  px: 12, usage: "back button" },
  { className: "rounded-2xl", px: 16, usage: "PRINCIPAL — inputs, botones, cards internas" },
  { className: "rounded-3xl", px: 24, usage: "BrandedFrame outer card, imágenes hero" },
];

/* ─── Breakpoints ─────────────────────────────────────── */
export type Breakpoint = {
  name: string;
  variant: string;
  media: string;
  testSize: string;
  description: string;
};

export const breakpoints: Breakpoint[] = [
  {
    name: "Vertical Mobile",
    variant: "vertical-mobile:",
    media: "(orientation: portrait) and (max-width: 767px)",
    testSize: "375 × 667",
    description: "Móvil en vertical. El más restrictivo en ancho.",
  },
  {
    name: "Vertical Tablet",
    variant: "vertical-tablet:",
    media: "(orientation: portrait) and (min-width: 768px)",
    testSize: "768 × 1024",
    description: "Tablet en vertical. Más espacio, mismo layout en columna.",
  },
  {
    name: "Horizontal Mobile",
    variant: "horizontal-mobile:",
    media: "(orientation: landscape) and (max-width: 1279px)",
    testSize: "667 × 375",
    description: "Móvil rotado. El más restrictivo en altura (375px).",
  },
  {
    name: "Horizontal Desktop",
    variant: "horizontal-desktop:",
    media: "(orientation: landscape) and (min-width: 1280px)",
    testSize: "1280 × 550",
    description: "Pantalla wide. Layout en dos columnas dentro de la card.",
  },
];

/* ─── Animation ───────────────────────────────────────── */
export const animations = [
  { name: "fadeInUp",   className: "animate-fade-in-up", duration: "0.4s", easing: "ease-out", usage: "entrada de elementos al montar" },
  { name: "float",      className: "animate-float",      duration: "3s",   easing: "ease-in-out infinite", usage: "mascota / elementos ambientales" },
  { name: "framer fade+y", className: "(framer-motion)", duration: "0.4s", easing: "default", usage: "stagger 0.15s entre bloques en pantallas con marca" },
];

/* ─── Iconography ─────────────────────────────────────── */
export const iconography = {
  library: "lucide-react",
  defaultSize: 22,
  sizes: { sm: 14, md: 18, lg: 22, xl: 24 },
  semanticPairs: [
    { positive: "MapPin",   negative: "MapPinOff", context: "ubicación válida vs no reconocida" },
    { positive: "Check",    negative: "AlertTriangle", context: "validación de formulario" },
    { positive: "Mic",      negative: "MicOff", context: "grabación de voz" },
  ],
};
