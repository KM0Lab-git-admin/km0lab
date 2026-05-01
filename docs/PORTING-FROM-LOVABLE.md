# Guía de porte: Lovable → producción (km0lab)

> **Lectura obligatoria** para cualquier agente o desarrollador que vaya a portar pantallas, componentes, assets o lógica desde el repo de Lovable al monorepo de producción `km0lab`. Si saltas esta guía vas a romper exactamente las mismas cosas que ya hemos roto antes.

Esta guía es **operativa**: pasos concretos, comandos exactos, anti-patrones aprendidos y caso de estudio resuelto. Para reglas generales del proyecto, consulta `AGENTS.md`. Para tabla de breakpoints y tokens, `docs/CONVENTIONS.md`.

---

## 1. Contexto: por qué hay dos repos

| Repo | Rol | Stack |
|---|---|---|
| **Lovable** — `KM0Lab-git-admin/speak-spanish-easily` | **Source of truth** de maqueta visual, design system y assets | Vite + React 18 + Tailwind v3 + shadcn + Framer Motion + React Router v6 |
| **Producción** — `KM0Lab-git-admin/km0lab` | App final, deploy a web (Vercel) y móvil (Capacitor) | Vite + React 19 + Tailwind v3 + shadcn + Framer Motion + React Router v7 + Capacitor (preparado, sin shells) |

Los dos repos comparten el mismo stack web. Las pantallas de Lovable se portan **casi 1:1** al monorepo. Los componentes en `packages/components` (`@km0lab/ui`) se mantienen en sintonía con `src/components/ui/` de Lovable (estilo shadcn).

**Source of truth por tipo de archivo:**

| Tipo | Source of truth |
|---|---|
| Pantallas, componentes UI específicos, layout | Lovable. Producción es consumidor. |
| Tokens del design system (`tokens.ts`, `aiContext.ts`) | Lovable. En producción viven en `packages/app/design-system/`. |
| Assets visuales (PNG, SVG, fonts) | Lovable. Producción los sincroniza con `pnpm sync:assets` (ver §6). |
| `tailwind.config.{ts,js}` | Espejo. Tienen que coincidir en variantes y tokens (ver §7.1). |
| Lógica de negocio (hooks, services, integraciones API) | Producción. Lovable solo maqueta. |

---

## 2. Pre-flight checklist (antes de portar nada)

Antes de copiar un solo archivo, ejecuta estos pasos en orden:

### 2.1. Clonar / actualizar los dos repos en local

```bash
# si es la primera vez:
git clone git@github.com:KM0Lab-git-admin/km0lab.git produccion
git clone git@github.com:KM0Lab-git-admin/speak-spanish-easily.git lovable

# si ya están clonados:
cd produccion && git checkout develop && git pull
cd ../lovable && git checkout main && git pull
```

### 2.2. Comparar `tailwind.config` de los dos repos

Esto es **crítico**: los breakpoints custom (`vertical-mobile`, `wide-landscape`, etc.) y los tokens deben existir en los dos lados, o las clases responsive del archivo portado se ignorarán silenciosamente.

```bash
# Lovable usa el archivo en .ts; producción en .js.
diff <(grep -E "addVariant|screens:" lovable/tailwind.config.ts | sort) \
     <(grep -E "addVariant|screens:" produccion/apps/km0lab/tailwind.config.js | sort)
```

Si el diff muestra variantes presentes en Lovable y ausentes en producción, **añádelas a producción antes de portar**. Variantes que históricamente han faltado: `short-landscape`, `wide-landscape`, `tablet-portrait`, `sm`, `md`, `lg`, `xl`.

### 2.3. Comparar fuentes y `@font-face`

Lovable carga Inter desde Google Fonts en `src/index.css`. Producción debe tener el mismo `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` al inicio de `apps/km0lab/src/styles/global.css`. Sin Inter, las fuentes `font-body` y `font-ui` caen en fallback del sistema y todos los textos quedan más anchos → desbordes y layouts rotos.

Verificar también que los `@font-face` de Antique Olive están en producción con paths que Vite pueda resolver (`../assets/fonts/...` desde `src/styles/global.css`).

### 2.4. Comparar dependencias

Si Lovable añadió librerías nuevas (ej. nueva dep en `package.json`), tienen que existir en `apps/km0lab/package.json` antes de portar archivos que las usen.

```bash
diff <(grep -E '"[a-z@]' lovable/package.json | sort) \
     <(grep -E '"[a-z@]' produccion/apps/km0lab/package.json | sort)
```

Decisión: si una dep en Lovable no aporta valor en producción (p. ej. `@radix-ui/react-aspect-ratio` cuando ninguna pantalla portada lo usa), no la añadas. Solo lo necesario.

### 2.5. Identificar lista de archivos a portar

Coordina con el humano. La lista típica:

- Pantallas en `lovable/src/pages/` que NO existan en `produccion/apps/km0lab/src/pages/`.
- Componentes en `lovable/src/components/` (no `ui/`) que NO existan en `produccion/apps/km0lab/src/components/`.
- Primitivos en `lovable/src/components/ui/` que NO existan en `produccion/packages/components/ui/`.
- Hooks, data, locales, services nuevos.
- Assets nuevos en `lovable/src/assets/` que NO estén en `produccion/scripts/assets-manifest.json`.

---

## 3. Mapping de archivos (regla mecánica)

Aplica este mapping sin pensarlo. Si dudas, mira la versión actual del Onboarding o Language como referencia.

| Lovable (`src/`) | Producción |
|---|---|
| `pages/<Pantalla>.tsx` | `apps/km0lab/src/pages/<Pantalla>.tsx` (mismo nombre, PascalCase) |
| `components/<Componente>.tsx` | `apps/km0lab/src/components/<Componente>.tsx` (mismo nombre) |
| `components/ui/<nombre>.tsx` | `packages/components/ui/<nombre>.tsx` (mismo nombre kebab) |
| `hooks/use-<x>.tsx` | `packages/app/hooks/use-<x>.ts` o `.tsx` (según contenido) |
| `data/<x>.ts` | `apps/km0lab/src/data/<x>.ts` (si solo lo usa una pantalla) o `packages/app/data/<x>.ts` (si compartido) |
| `services/<x>.ts` | `packages/app/services/<x>.ts` |
| `lib/utils.ts` | ya existe en `apps/km0lab/src/lib/utils.ts` Y en `packages/components/lib/utils.ts` (ojo: dos copias por contexto) |
| `assets/<archivo>.png` o `.svg` | `apps/km0lab/src/assets/images/<archivo>` (renombrado a kebab-case si tiene underscore) |
| `assets/fonts/<archivo>.ttf` | `apps/km0lab/src/assets/fonts/<archivo>` (sin sufijos numéricos) |
| `index.css` (variables CSS, fuentes) | `apps/km0lab/src/styles/global.css` |

**Decisiones obligatorias al portar archivos:**

- **`@/` alias**: Lovable y producción usan `@/` para `src/`. Los imports relativos no necesitan cambio en pantallas y componentes que viven dentro de `apps/km0lab/src/`. Los componentes en `packages/` NO tienen alias `@/` y deben usar paths relativos (`../lib/utils`).
- **Imports cross-package**: si la pantalla portada importa de `@km0lab/ui` o `@km0lab/app`, déjalo tal cual.

---

## 4. Receta: portar una pantalla

### 4.1. Pre-checks específicos del archivo

Antes de copiar `src/pages/X.tsx`, ejecuta estos greps para detectar lo que necesitas en producción:

```bash
# 1. Breakpoints responsive usados.
grep -oE ':(sm|md|lg|xl|2xl|landscape|portrait|vertical-mobile|vertical-tablet|horizontal-mobile|horizontal-desktop|wide-landscape|short-landscape|tablet-portrait):' lovable/src/pages/X.tsx | sort -u

# 2. Imports.
grep "^import" lovable/src/pages/X.tsx
```

Para cada breakpoint que aparezca: verifica que está definido en `apps/km0lab/tailwind.config.js`. Si falta alguno, añádelo (ver §7.1).

Para cada import:
- Si es de `react`, `react-router-dom`, `framer-motion`, `lucide-react`, `clsx`: ya están en producción.
- Si es de `@/components/...`, `@/lib/utils`, `@/data/...`, `@/assets/...`: verifica que el componente/dato/asset destino existe en producción. Si no, pórtalos primero (recursivamente).
- Si es de un primitivo shadcn (`@/components/ui/X`): verifica que existe en `packages/components/ui/X.tsx`. Si no, pórtalo (ver §5).

### 4.2. Copiar y adaptar

```bash
cp lovable/src/pages/X.tsx produccion/apps/km0lab/src/pages/X.tsx
```

Adapta paths de assets si los nombres cambiaron (Lovable suele tener underscore, producción dash):

```bash
# Sustitución típica:
sed -i 's|@/assets/km0_robot_icon_v2.png|@/assets/images/km0-robot.png|g' produccion/apps/km0lab/src/pages/X.tsx
sed -i 's|@/assets/flags/flag-|@/assets/images/flags/flag-|g' produccion/apps/km0lab/src/pages/X.tsx
```

Verifica que cada import resuelve:

```bash
cd produccion && grep "^import" apps/km0lab/src/pages/X.tsx
```

### 4.3. Añadir la pantalla al router

Edita `apps/km0lab/src/App.tsx` y añade la ruta:

```tsx
const X = lazy(() => import('./pages/X'))

// Dentro de <Routes>:
<Route path="/<x-kebab>" element={<X />} />
```

El path en kebab-case. El componente lazy-loaded.

### 4.4. Validación local

```bash
cd produccion
pnpm install                          # si añadiste deps
pnpm dev                              # arranca http://localhost:5173
```

Visita `http://localhost:5173/<x-kebab>` en navegador (NO en modo responsive de DevTools — ver §7.5).

Verifica las **4 resoluciones canónicas** redimensionando la ventana real:
- 375 × 667 (vertical-mobile)
- 768 × 1024 (vertical-tablet)
- 667 × 375 (horizontal-mobile)
- 1280 × 550 (horizontal-desktop)

Compara cada resolución con `<dominio-publicado-de-lovable>.lovable.app/<x-kebab>`. Deben verse idénticas.

### 4.5. Validación CI

```bash
pnpm validate                         # type:check + lint + format:check
```

Resuelve cualquier error antes de commitear.

---

## 5. Receta: portar un primitivo shadcn nuevo

Cuando una pantalla portada importa de `@km0lab/ui` un primitivo que aún no existe (p. ej. `Tabs`, `Dialog`, `Sheet`):

### 5.1. Decidir si lo creamos en `@km0lab/ui` o solo en la app

- Si el primitivo lo va a usar **más de una pantalla**: créalo en `packages/components/ui/<nombre>.tsx` (compartido).
- Si solo lo usa **esa pantalla concreta**: créalo en `apps/km0lab/src/components/<NombrePascal>.tsx`.

Ante la duda: shared en `@km0lab/ui`. Es más fácil moverlo a app-specific después que al revés.

### 5.2. Copiar y adaptar

```bash
cp lovable/src/components/ui/<nombre>.tsx produccion/packages/components/ui/<nombre>.tsx
```

Cambia el import de `cn`:

```bash
sed -i 's|from "@/lib/utils"|from "../lib/utils"|g' produccion/packages/components/ui/<nombre>.tsx
```

Si el primitivo depende de `@radix-ui/react-<xxx>` que no esté en `packages/components/package.json`, añádelo:

```bash
cd produccion && pnpm --filter "@km0lab/ui" add @radix-ui/react-<xxx>@<version>
```

(Usa la misma versión que tenga Lovable.)

### 5.3. Re-exportar desde el barrel

Edita `packages/components/index.ts` y añade:

```ts
export * from './ui/<nombre>'
```

Sin esto, `import { X } from '@km0lab/ui'` no encuentra el componente.

### 5.4. Validación

```bash
pnpm install                          # si añadiste @radix-ui
pnpm validate                         # debe pasar typecheck
```

---

## 6. Receta: portar/sincronizar assets binarios

Los binarios (PNG, SVG, fonts) viven en Lovable. Producción los sincroniza con `pnpm sync:assets`.

### 6.1. Para añadir un asset nuevo

1. Edita `produccion/scripts/assets-manifest.json` y añade una entrada `{ from, to }`:

```json
{
  "from": "src/assets/<nombre-en-lovable>.png",
  "to": "apps/km0lab/src/assets/images/<nombre-en-produccion>.png"
}
```

Convención de nombres: en producción usa **kebab-case** (`km0-robot.png`, no `km0_robot_icon_v2.png`). El script de sync respeta los nombres del `to`.

2. Ejecuta el sync:

```bash
pnpm sync:assets
```

3. Commitea el binario resultante.

### 6.2. Si un asset ya existente cambió en Lovable

Mismo `pnpm sync:assets` re-descarga el binario. El script **sobrescribe siempre** (decisión documentada en `AGENTS.md` §10). Commitea el cambio.

### 6.3. Para fuentes

Las fuentes Antique Olive ya están en producción. Si Lovable añade una fuente nueva (peso o variante):

1. Copia el TTF de Lovable a `apps/km0lab/src/assets/fonts/` (renombra quitando sufijos numéricos: `Antique-Olive-Std-X_NNNN.ttf` → `Antique-Olive-Std-X.ttf`).
2. Añade el `@font-face` correspondiente en `apps/km0lab/src/styles/global.css`.

Patrón:
```css
@font-face {
  font-family: 'Antique Olive';
  src: url('../assets/fonts/Antique-Olive-Std-<X>.ttf') format('truetype');
  font-weight: <peso>;
  font-style: normal;
  font-display: swap;
}
```

---

## 7. Anti-patrones aprendidos

Estas son lecciones aprendidas a las malas. Si las ignoras, las pantallas portadas se romperán.

### 7.1. Aliases de breakpoints en código de Lovable

Aunque la knowledge de Lovable diga "usa solo los 4 breakpoints semánticos", el **código existente** en Lovable sigue usando aliases viejos:

```
sm:                  ← Tailwind default 640px
md: lg: xl:          ← Tailwind defaults
short-landscape:     ← alias custom de Lovable, equivale a horizontal-mobile
wide-landscape:      ← equivale a horizontal-desktop
tablet-portrait:     ← equivale a vertical-tablet
landscape:           ← Tailwind default
portrait:            ← Tailwind default
```

Estos aliases viven en el `tailwind.config.ts` de Lovable (`addVariant` calls al final del archivo) y se usan libremente en componentes. **Mi `tailwind.config.js` los tiene replicados** en producción. Si los quitamos algún día, hay que refactorizar TODO el código portado primero.

**Verificación al portar**: ejecuta el grep de §4.1 y compara con la lista de variantes definidas en `apps/km0lab/tailwind.config.js`. Si una variante falta, añádela como alias antes de portar:

```js
// dentro del plugin function en tailwind.config.js:
addVariant('<nombre>', '@media <regla>')
```

### 7.2. Inter via Google Fonts es obligatorio

Lovable carga Inter via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` al inicio de `src/index.css`. Producción debe replicarlo en `apps/km0lab/src/styles/global.css` (ya está desde commit `1d07281`).

Sin Inter, todos los textos `font-body` y `font-ui` caen en fallback del sistema (Helvetica/Arial), que tiene **métricas más anchas**: líneas más altas, texto que ocupa más espacio, **layouts que se desbordan** y footers que se superponen al contenido.

### 7.3. Paths de fuentes Antique Olive son distintos en cada repo

| Repo | Path |
|---|---|
| Lovable | `public/Antique-Olive-Std-<X>_<NNNN>.ttf` (servidos desde root público) |
| Producción | `apps/km0lab/src/assets/fonts/Antique-Olive-Std-<X>.ttf` (servidos vía Vite import) |

Cuando portas el `@font-face` de Lovable a producción, **cambia el `url()` a path relativo** (`../assets/fonts/...`) y **renombra el archivo** quitando el sufijo numérico (`Antique-Olive-Std-Black_3861.ttf` → `Antique-Olive-Std-Black.ttf`). Si dejas los nombres de Lovable o el path absoluto, las fuentes no cargan en producción.

### 7.4. SVG como import: URL string, no React component

En Vite default, `import flagCa from '@/assets/flags/flag-ca.svg'` da una **URL string** (path al SVG). Se usa como `<img src={flagCa}>`. Eso es lo que Lovable hace y producción replica.

NO instales `vite-plugin-svgr` para que SVG sean componentes React: Lovable no lo usa, y romperías la compatibilidad de los imports.

### 7.5. NO valides en modo responsive de DevTools

El modo responsive de Chrome/Edge DevTools renderiza dentro de un iframe simulado donde `100dvh` y media queries pueden interpretarse de forma distinta. **Las pantallas se pueden ver mal en modo responsive y bien en ventana real**, o al revés.

Para QA visual usa **ventana real del navegador** redimensionada manualmente:

```js
// en la consola del navegador:
window.resizeTo(667, 375)   // horizontal-mobile
window.resizeTo(375, 667)   // vertical-mobile
window.resizeTo(768, 1024)  // vertical-tablet
window.resizeTo(1280, 550)  // horizontal-desktop
```

Si la pantalla se ve bien en ventana real pero mal en modo responsive, **es un falso positivo**. No corrijas el código basándote solo en el modo responsive.

### 7.6. Lovable evoluciona — sincroniza antes de portar

Lovable es un editor visual con commits frecuentes. Entre tu sesión anterior y la actual, Lovable puede haber cambiado pantallas, componentes, tokens. **Siempre haz `git pull` en el repo de Lovable antes de portar** para tener la última versión.

Verificación rápida:
```bash
cd lovable && git fetch origin main
git log HEAD..origin/main --oneline | head -10
```

Si hay commits nuevos, decide qué hacer: incorporarlos al porte o portar la versión vieja a propósito.

### 7.7. Reescribir un archivo portado puede regresar lo viejo

Si el agente humano dice "porta la pantalla X otra vez porque cambió en Lovable", asegúrate de **eliminar primero la versión vieja en producción**. Un porte parcial sobre un archivo viejo deja restos y rompe el render.

---

## 8. Checklist de validación post-porte

Antes de hacer commit (o de pedir merge), confirma todos:

- [ ] `pnpm install` sin errores.
- [ ] `pnpm validate` (type:check + lint + format:check) verde.
- [ ] `pnpm dev` arranca y la nueva ruta no muestra errores en consola.
- [ ] Las 4 resoluciones canónicas se ven igual que en `<dominio>.lovable.app/<ruta>` (verificación en **ventana real**, no en DevTools responsive).
- [ ] No hay clases responsive ignoradas (verificar con `grep -oE ':(sm|md|...):' src/pages/X.tsx` que todas existen en `tailwind.config.js`).
- [ ] Si es shared en `@km0lab/ui`, está re-exportado desde `packages/components/index.ts`.
- [ ] Si añadiste assets binarios, están sincronizados via `pnpm sync:assets` y commiteados.
- [ ] Si añadiste deps, `pnpm-lock.yaml` regenerado.
- [ ] Commit con formato Conventional (subject ≤50 chars, imperativo).
- [ ] Si el cambio es sustancial (port de pantalla completa, refactor multi-fichero, deps nuevas): rama + PR. Si es trivial (typo, ajuste menor): push directo a develop con bypass (ver `AGENTS.md` §8.3).

---

## 9. Caso de estudio: porte del Onboarding (lecciones reales)

Este es el porte donde aprendimos los anti-patrones documentados arriba. Sirve como referencia para no repetirlos.

### Contexto

Migración del repo de producción de Expo + React Native + NativeWind a Vite + React + Tailwind v3 puro. Como parte de la migración, se portó el `Onboarding.tsx` desde Lovable (era idéntico al de Lovable).

### Síntoma

En `localhost:5173/onboarding` a 667×375 (horizontal-mobile):

- El footer (1/5 + dots de paginación + botón SALTAR) aparecía **superpuesto al texto** del slide.
- El texto de la descripción quedaba **cortado** detrás del footer.
- En `char-con-todos.lovable.app/onboarding` (Lovable publicado) a la misma resolución, se veía **correctamente**: footer abajo, texto completo, todo en su sitio.

### Diagnóstico paso a paso

**1. ¿El código es idéntico?**
```bash
diff lovable/src/pages/Onboarding.tsx produccion/apps/km0lab/src/pages/Onboarding.tsx
diff lovable/src/components/BrandedFrame.tsx produccion/apps/km0lab/src/components/BrandedFrame.tsx
```
Resultado: cero diferencias. El código copiado era idéntico.

**2. ¿Es problema de fuentes?**
Verificación en DevTools → Network filtrando "font". En localhost no aparecía request a Inter (Google Fonts). En Lovable sí.

Causa: Lovable carga Inter via `@import` en `src/index.css`. Mi `apps/km0lab/src/styles/global.css` no lo tenía. Sin Inter, `font-body` (declarado como `['DM Sans', 'Inter', 'sans-serif']`) caía en fallback.

Fix: commit `1d07281` añade el `@import` de Google Fonts.

**3. Después del fix de Inter, el problema persistía.**

Causa real (más profunda): el `Onboarding.tsx` usa muchas clases con `wide-landscape:`, `short-landscape:` y `sm:` (visibles con `grep -oE ':(sm|wide|short|md):' Onboarding.tsx`). Cuando reescribí el `tailwind.config.js` durante la migración a Vite, **eliminé esas variantes** asumiendo que solo se usaban los 4 semánticos. Tailwind ignoraba esas clases sin warning, y el viewport horizontal-mobile renderizaba con valores default (los más grandes), causando overflow.

Fix: commit `ebb8e41` re-añade los aliases (`short-landscape`, `wide-landscape`, `tablet-portrait`) y screens estándar (`sm`, `md`, `lg`, `xl`, `2xl`) al `tailwind.config.js`.

### Lecciones extraídas

- **No confíes en la knowledge declarativa de Lovable** ("solo usar los 4 breakpoints"). El código existente en Lovable ignora esa regla. Replica el config tal cual.
- **Verifica las fuentes cargan** en Network antes de asumir que el porte está bien.
- **Valida en ventana real**, no en DevTools responsive — al menos en algún punto.
- **Cada nueva pantalla portada hace `grep` de breakpoints** y los compara con el config. Si falta alguno, añádelo antes de copiar.

---

## 10. Plantillas de prompt para agentes nuevos

Cuando arranques un chat nuevo (Sonnet, Opus, otro modelo) y le quieras pedir que porte:

### 10.1. Prompt para portar una pantalla

> Tengo dos repos: `KM0Lab-git-admin/speak-spanish-easily` (Lovable, source of truth visual) y `KM0Lab-git-admin/km0lab` (producción). Quiero portar la pantalla `<X>` desde Lovable al monorepo de producción.
>
> Antes de tocar nada: lee `docs/PORTING-FROM-LOVABLE.md` del repo de producción, `AGENTS.md` y `docs/CONVENTIONS.md`. Sigue la receta de la sección 4 paso a paso. Si dudas, pregunta antes de actuar.
>
> Cuando termines, pásame el commit/PR para revisar.

### 10.2. Prompt para portar varios archivos a la vez

> Quiero portar de Lovable a producción los siguientes archivos: `<lista>`.
>
> Antes de tocar nada: lee `docs/PORTING-FROM-LOVABLE.md`, `AGENTS.md` y `docs/CONVENTIONS.md`. Ejecuta primero la sección 2 (pre-flight checklist) entera. Después porta uno por uno siguiendo §4 (pantallas) o §5 (componentes shadcn). Para los assets, usa la receta §6.
>
> Si descubres alguna divergencia entre los configs (Tailwind, fuentes, deps), repórtamela antes de avanzar.

---

## 11. Cuándo este documento queda desactualizado

Esta guía cubre el porte tal como funciona hoy. **Quedará desactualizada si**:

- Se elimina un alias de breakpoint del `tailwind.config.js` de Lovable o producción (cambia §7.1).
- Se cambia el bundler (de Vite a otro) en producción.
- Se cambia el sistema de fuentes (auto-host de Inter en lugar de Google Fonts CDN).
- Se introduce un nuevo tipo de archivo en Lovable (animaciones Lottie, vídeos, etc.) que aún no tiene receta aquí.
- Se decide refactorizar Lovable para eliminar los aliases viejos (cambiaría §7.1).

Cuando ocurra alguno de esos cambios, **actualiza este documento en el mismo PR** que introduzca el cambio. Documentación viva.
