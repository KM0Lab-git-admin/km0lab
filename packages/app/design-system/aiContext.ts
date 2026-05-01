/**
 * Generates the full "AI prompt pack" string for external LLMs.
 * Output is a single Markdown document copy-pasteable into ChatGPT/Claude/etc.
 */
import {
  colorScales,
  semanticTokens,
  typography,
  typeScale,
  spacingScale,
  radiusScale,
  breakpoints,
  animations,
  iconography,
} from "./tokens";

export function generateAIContext(): string {
  const lines: string[] = [];

  lines.push("# KM0 LAB — Design System Context for AI Prototyping");
  lines.push("");
  lines.push("> Pega este documento como _system prompt_ al iniciar una conversación con la IA que generará prototipos. Incluye TODAS las restricciones del sistema KM0 LAB. La IA debe respetarlas literalmente.");
  lines.push("");

  /* ── Stack ─────────────────────────────────────── */
  lines.push("## 1. Stack y convenciones");
  lines.push("- React 18 + TypeScript + Vite");
  lines.push("- Tailwind CSS v3 + shadcn/ui (Radix)");
  lines.push("- Framer Motion para animaciones");
  lines.push("- lucide-react para iconografía");
  lines.push("- React Router v6");
  lines.push("");
  lines.push("**Reglas obligatorias:**");
  lines.push("- NUNCA usar colores hex/rgb crudos en componentes. Solo tokens semánticos o paleta `km0-*`.");
  lines.push("- NUNCA modificar los breakpoints (están alineados con Playwright en producción).");
  lines.push("- Mobile-first: el layout base es portrait; landscape es variante explícita.");
  lines.push("- Pantallas con marca (entrada, login, configuración) DEBEN envolverse en `<BrandedFrame>`. Chat usa fullbleed propio.");
  lines.push("");

  /* ── Color tokens ──────────────────────────────── */
  lines.push("## 2. Tokens semánticos (preferir siempre estos)");
  lines.push("");
  lines.push("| Token | Mapea a | Uso |");
  lines.push("|---|---|---|");
  semanticTokens.forEach(t => {
    lines.push(`| \`${t.name}\` | ${t.mapsTo} | ${t.description} |`);
  });
  lines.push("");

  lines.push("## 3. Paleta KM0 cruda (cuando un semántico no encaja)");
  lines.push("");
  colorScales.forEach(scale => {
    lines.push(`### ${scale.name} — _principal: ${scale.principal}_`);
    lines.push(`${scale.description}`);
    lines.push("");
    lines.push("| Shade | HSL | Hex | Uso |");
    lines.push("|---|---|---|---|");
    scale.shades.forEach(s => {
      lines.push(`| ${s.shade} | \`${s.hsl}\` | \`${s.hex}\` | ${s.usage ?? ""} |`);
    });
    lines.push("");
  });

  /* ── Typography ────────────────────────────────── */
  lines.push("## 4. Tipografía");
  lines.push("");
  lines.push("Tres familias semánticas. **El peso está implícito en la familia** — NO añadir `font-bold`/`font-semibold` sobre `font-brand` (ya es Black 900).");
  lines.push("");
  lines.push("| Clase | Familia | Peso | Uso |");
  lines.push("|---|---|---|---|");
  typography.forEach(t => {
    lines.push(`| \`${t.className}\` | ${t.family} | ${t.weight} | ${t.usage} |`);
  });
  lines.push("");
  lines.push("### Escala de tamaños usada en el proyecto");
  lines.push("");
  lines.push("| Clase | px | line-height | Uso |");
  lines.push("|---|---|---|---|");
  typeScale.forEach(s => {
    lines.push(`| \`${s.className}\` | ${s.px} | ${s.lineHeight} | ${s.usage} |`);
  });
  lines.push("");

  /* ── Spacing & radius ──────────────────────────── */
  lines.push("## 5. Spacing");
  lines.push("");
  lines.push("| Token Tailwind | px | Uso típico |");
  lines.push("|---|---|---|");
  spacingScale.forEach(s => {
    lines.push(`| \`gap-${s.token}\` / \`p-${s.token}\` | ${s.px} | ${s.usage ?? ""} |`);
  });
  lines.push("");
  lines.push("## 6. Border Radius");
  lines.push("");
  lines.push("| Clase | px | Uso |");
  lines.push("|---|---|---|");
  radiusScale.forEach(r => {
    lines.push(`| \`${r.className}\` | ${r.px} | ${r.usage ?? ""} |`);
  });
  lines.push("");

  /* ── Breakpoints ───────────────────────────────── */
  lines.push("## 7. Breakpoints (CRÍTICO)");
  lines.push("");
  lines.push("Solo existen estos cuatro. Están sincronizados con Playwright. Cualquier diseño responsive DEBE expresarse con estas variantes:");
  lines.push("");
  lines.push("| Variante Tailwind | Media query | Resolución de test |");
  lines.push("|---|---|---|");
  breakpoints.forEach(b => {
    lines.push(`| \`${b.variant}\` | \`@media ${b.media}\` | ${b.testSize} |`);
  });
  lines.push("");
  lines.push("Aliases DEPRECADOS (no usar): `short-landscape`, `wide-landscape`, `tablet-portrait`.");
  lines.push("");

  /* ── Animations ────────────────────────────────── */
  lines.push("## 8. Animaciones");
  lines.push("");
  lines.push("| Nombre | Cómo aplicar | Duración | Uso |");
  lines.push("|---|---|---|---|");
  animations.forEach(a => {
    lines.push(`| ${a.name} | \`${a.className}\` | ${a.duration} | ${a.usage} |`);
  });
  lines.push("");
  lines.push("**Patrón estándar de entrada de pantalla** (Framer Motion):");
  lines.push("```tsx");
  lines.push("<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}");
  lines.push("  transition={{ duration: 0.4, delay: 0.25 }}>");
  lines.push("```");
  lines.push("Usar `delay` escalonado de 0.15s, 0.25s, 0.3s, 0.35s entre bloques verticales.");
  lines.push("");

  /* ── Iconography ───────────────────────────────── */
  lines.push("## 9. Iconografía");
  lines.push(`- Librería: **${iconography.library}**`);
  lines.push(`- Tamaño por defecto: ${iconography.defaultSize}px`);
  lines.push(`- Tamaños semánticos: sm=${iconography.sizes.sm}, md=${iconography.sizes.md}, lg=${iconography.sizes.lg}, xl=${iconography.sizes.xl}`);
  lines.push("- Pares semánticos (estado positivo / negativo):");
  iconography.semanticPairs.forEach(p => {
    lines.push(`  - \`${p.positive}\` ↔ \`${p.negative}\` — ${p.context}`);
  });
  lines.push("");

  /* ── Componentes base ──────────────────────────── */
  lines.push("## 10. Componentes base — JSX listo para usar");
  lines.push("");
  lines.push("### Botón primario");
  lines.push("```tsx");
  lines.push(`<button className="w-full bg-primary text-primary-foreground font-ui font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none">`);
  lines.push("  CONTINUAR");
  lines.push("</button>");
  lines.push("```");
  lines.push("");
  lines.push("### Input con estados (idle / error)");
  lines.push("```tsx");
  lines.push("<div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition-colors ${");
  lines.push(`  hasError`);
  lines.push(`    ? "bg-destructive/5 border-destructive/50 focus-within:border-destructive"`);
  lines.push(`    : "bg-white border-km0-beige-200 focus-within:border-km0-teal-400"`);
  lines.push("}`}>");
  lines.push(`  {hasError ? <MapPinOff className="text-destructive" size={22} /> : <MapPin className="text-km0-teal-500" size={22} />}`);
  lines.push(`  <input className="flex-1 bg-transparent font-ui text-lg outline-none placeholder:text-muted-foreground/50" />`);
  lines.push("</div>");
  lines.push("```");
  lines.push("");
  lines.push("### BrandedFrame (wrapper obligatorio para pantallas de marca)");
  lines.push("```tsx");
  lines.push(`<BrandedFrame onBack={() => navigate(-1)} backAriaLabel="Back">`);
  lines.push("  {/* Contenido de la pantalla. Renderiza vistas separadas para portrait / landscape: */}");
  lines.push(`  <div className="landscape:hidden flex flex-col gap-6 vertical-mobile:gap-7">…</div>`);
  lines.push(`  <div className="hidden landscape:flex gap-4 horizontal-desktop:gap-8">…</div>`);
  lines.push("</BrandedFrame>");
  lines.push("```");
  lines.push("");

  /* ── Anti-patterns ─────────────────────────────── */
  lines.push("## 11. Anti-patrones (NO hacer)");
  lines.push("- ❌ `text-white`, `bg-black`, `text-[#174094]` → usar tokens.");
  lines.push("- ❌ `font-brand font-bold` → `font-brand` ya es weight 900.");
  lines.push("- ❌ `md:`, `lg:`, `xl:`, `sm:` (breakpoints Tailwind por defecto) → usar `vertical-mobile:`, `vertical-tablet:`, `horizontal-mobile:`, `horizontal-desktop:`.");
  lines.push("- ❌ `h-screen` en pantallas con scroll → usar `min-h-[100dvh]` o el layout fixed del Chat (`fixed inset-0 overflow-hidden`).");
  lines.push("- ❌ Logo y back button posicionados manualmente → siempre vía `<BrandedFrame>`.");
  lines.push("- ❌ Hex/rgb crudos en `style={{}}` → solo tokens HSL via `hsl(var(--token))`.");
  lines.push("");

  /* ── Resoluciones de QA ────────────────────────── */
  lines.push("## 12. Resoluciones de validación (Playwright)");
  lines.push("Cualquier prototipo DEBE funcionar sin scroll vertical en estas 4 resoluciones (excepto Chat):");
  lines.push("- 375 × 667 (vertical-mobile)");
  lines.push("- 768 × 1024 (vertical-tablet)");
  lines.push("- 667 × 375 (horizontal-mobile) ← más restrictiva en altura");
  lines.push("- 1280 × 550 (horizontal-desktop) ← también restrictiva en altura");
  lines.push("");

  return lines.join("\n");
}
