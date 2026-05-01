# AGENTS.md — Reglas para agentes de IA en km0lab

Este archivo define las reglas que cualquier agente de IA (Claude, Cursor,
Windsurf, Copilot…) DEBE cumplir al trabajar en este repositorio.

Si las instrucciones del usuario entran en conflicto con este documento,
**pregunta antes de actuar**. No asumas.

Consulta `docs/CONVENTIONS.md` para detalles y ejemplos largos.

---

## 1. Arquitectura del monorepo

- Gestor: **pnpm** (workspaces en `pnpm-workspace.yaml`).
- Orquestador: **Turbo** (`npx turbo run <task>`).
- Estructura:
  - `apps/*` — aplicaciones.
  - `packages/*` — librerías compartidas.
- App principal: **`apps/km0lab`** (Expo SDK 55 + React Native 0.83 +
  React 19 + expo-router + NativeWind 4 + TypeScript ~5.9).
- UI compartida: **`@km0lab/ui`** → `packages/components`.
- Lógica compartida: **`@km0lab/app`** → `packages/app`.
- Tema web (Next.js/Vite): **`@km0lab/web-theme`** → `packages/km0lab-web-theme`.
- Solo existen entornos `development` y `production`.

Comandos estándar (siempre desde la raíz del monorepo):

```bash
pnpm install
npx turbo run dev
npx turbo run type:check lint
pnpm --filter km0lab build:web
```

Para arrancar dev global: **usar `npx turbo run dev`**, no `npm run dev`.
Si solo se necesita la app web de `km0lab`, usar
**`pnpm --filter km0lab web`** para evitar levantar todo el monorepo.

---

## 2. Dónde va cada cosa

| Tipo de archivo | Ubicación | Extensión |
|---|---|---|
| Pantalla / ruta de la app | `apps/km0lab/app/<segmento-kebab>/index.tsx` | `.tsx` |
| Layout de ruta | `apps/km0lab/app/.../_layout.tsx` | `.tsx` |
| Componente específico de una pantalla | `apps/km0lab/components/<Componente>.tsx` | `.tsx` |
| Componentes auxiliares de una pantalla con varios sub-componentes | `apps/km0lab/components/<ComponentePadre>/<ComponenteHijo>.tsx` | `.tsx` |
| Componente compartido (UI) | `packages/components/ui/<nombre-kebab>.tsx` | `.tsx` |
| Utilidad compartida | `packages/app/utils/<nombre>.ts` | `.ts` |
| Hook compartido | `packages/app/hooks/use<Nombre>.ts` | `.ts` |
| Icono compartido | `packages/components/icons/<nombre>.tsx` | `.tsx` |
| Estilos CSS globales | `apps/km0lab/styles/global.css` | `.css` |
| Tokens de tema | `apps/km0lab/tailwind.config.js` (`theme.extend`) | `.js` |
| Variables de entorno | `apps/km0lab/env/.env.development` / `.env.production` | — |

Cada componente nuevo en `@km0lab/ui` **debe** exportarse en
`packages/components/index.ts`.

### Coherencia con Lovable

Los componentes específicos de pantalla viven **planos** en
`apps/km0lab/components/` con el **mismo nombre de archivo** que en el repo
de Lovable. Solo se agrupan en una subcarpeta PascalCase cuando una pantalla
tiene varios componentes auxiliares propios.

Mapping fijo entre Lovable y producción:

| Lovable (`src/`) | Producción |
|---|---|
| `components/<Componente>.tsx` | `apps/km0lab/components/<Componente>.tsx` |
| `components/ui/<nombre>.tsx` | `packages/components/ui/<nombre>.tsx` |
| `pages/<Pantalla>.tsx` | `apps/km0lab/app/<pantalla-kebab>/index.tsx` |
| `hooks/use-<x>.tsx` | `packages/app/hooks/use-<x>.ts` |
| `services/<x>.ts` | `packages/app/services/<x>.ts` |
| `data/<x>.ts` | `packages/app/data/<x>.ts` |
| `lib/utils.ts` | ya existe en `packages/components/lib/utils.tsx` |

La regla para rutas es mecánica: PascalCase de Lovable → kebab-case +
`/index.tsx` en producción. La conversión nunca se discute caso a caso.

---

## 3. Convenciones de nombres

- **Archivos de componentes**:
  - En `packages/components/ui/*`: `kebab-case` (shadcn-style).
  - En `apps/km0lab/components/*`: `PascalCase`, planos por defecto.
- **Carpetas de agrupación de componentes en `apps/km0lab/components/*`**:
  `PascalCase` coincidiendo con el nombre del componente padre. Solo se crean
  cuando una pantalla tiene varios componentes auxiliares propios.
- **Hooks**: `useXxx` en `camelCase`.
- **Utilidades**: `camelCase` (`formatDate.ts`, `buildQuery.ts`).
- **Tipos** exportados: `PascalCase`, sin prefijo `I`.
- **Assets / iconos**: nombres en `kebab-case`.
- **Rutas de Expo Router**: segmentos en `kebab-case`.

No uses abreviaturas oscuras. Usa inglés para el código y los identificadores.
La copy de producto puede ir en el idioma que indique la pantalla.

---

## 4. Estilos — reglas duras

Obligatorio cumplir TODAS:

1. **Prohibido `style="..."` inline** en JSX / HTML.
2. **Prohibidas clases arbitrarias con literales**:
   `text-[#...]`, `bg-[...]`, `p-[13px]`, `w-[calc(...)]`, `bg-[url(...)]`, etc.
3. **Prohibidos atributos de presentación** en markup (`color=`, `size=`, `face=`,
   `bgcolor=`…).
4. Todo estilo nace de:
   - `apps/km0lab/tailwind.config.js` (`theme.extend`), o
   - Variables CSS en `apps/km0lab/styles/global.css` (`:root`), o
   - Utilidades / componentes en `@layer base|components|utilities`.
5. Usa **tokens semánticos**: `primary`, `secondary`, `foreground`,
   `background`, `muted`, `accent`, `destructive`, `success`, `info`,
   `warning`, `card`, `border`, `ring`.
6. Si falta un valor → **primero** añade token/variable, **después** usa la clase.
7. Las preferencias de NativeWind `web:`, `native:`, `ios:`, `android:`
   son la forma correcta de diferenciar plataformas; no crees ramas JS para estilos.

### Breakpoints del proyecto

Hay que distinguir dos cosas:

**1. Breakpoints CSS (rangos)** — definidos en `apps/km0lab/tailwind.config.js`
como `screens`. Cubren rangos amplios de viewport y se aplican vía clases
NativeWind:

- `vertical-mobile` — `(orientation: portrait) and (max-width: 767px)`.
- `vertical-tablet` — `(orientation: portrait) and (min-width: 768px)`.
- `horizontal-mobile` — `(orientation: landscape) and (max-width: 1279px)`.
- `horizontal-desktop` — `(orientation: landscape) and (min-width: 1280px)`.

Toda combinación de orientación + ancho cae siempre en exactamente un
breakpoint. Los umbrales (768 portrait y 1280 landscape) coinciden con los
puntos canónicos de validación, así que los puntos canónicos quedan dentro
del rango de su breakpoint.

**2. Resoluciones canónicas de validación visual (Playwright)** — los cuatro
puntos exactos contra los que se valida la maqueta:

- `vertical-mobile` — 375 × 667.
- `vertical-tablet` — 768 × 1024.
- `horizontal-mobile` — 667 × 375.
- `horizontal-desktop` — 1280 × 550.

Playwright debe capturar exactamente estas cuatro resoluciones. La maqueta
se diseña en estos cuatro puntos exactos, pero los estilos CSS cubren los
rangos completos para que usuarios reales con resoluciones intermedias
(p. ej. 1366 × 768) también se vean bien.

Consulta `docs/CONVENTIONS.md` para la tabla completa.

---

## 5. Componentes

- Reutiliza primitivos de `@km0lab/ui` **antes** de crear algo nuevo.
- Si un componente solo se usa en una pantalla, vive en
  `apps/km0lab/components/...`, no en `@km0lab/ui`.
- Composición explícita (`<Card>`, `<CardHeader>`, `<CardContent>`...)
  antes que props mágicas.
- Props tipadas en TypeScript. **No `any`**. Si es inevitable, documenta por qué.
- React Native por defecto: **no** añadas `"use client"`.
- Iconos: `cssInterop` ya está centralizado en `lib/utils.tsx` (`interopIcon`).

Patrón de un componente nuevo en `@km0lab/ui`:

```tsx
import { cva } from 'class-variance-authority'
import { View } from 'react-native'

import { cn } from '@km0lab/ui/lib/utils'

import type { VariantProps } from 'class-variance-authority'

const widgetVariants = cva('rounded-2xl border border-border bg-card p-4', {
  variants: {
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: { tone: 'default' },
})

type WidgetProps = React.ComponentProps<typeof View> &
  VariantProps<typeof widgetVariants>

function Widget({ className, tone, ...props }: WidgetProps) {
  return <View className={cn(widgetVariants({ tone }), className)} {...props} />
}

export { Widget, widgetVariants }
export type { WidgetProps }
```

---

## 6. Pantallas (expo-router)

- Una ruta = un archivo dentro de `apps/km0lab/app/`.
- Layouts comunes: `_layout.tsx` al nivel adecuado.
- Cada pantalla debe contemplar: **loading**, **empty**, **error** y
  **estado feliz**.
- La copy de producto no va hardcodeada en componentes de `@km0lab/ui`
  (vive en pantallas o en features).
- Navegación: usar `expo-router` (`<Link>`, `useRouter`). No mezclar con
  otra librería de navegación.

---

## 7. Import order

Orden obligatorio, **sin** líneas en blanco dentro del mismo grupo:

1. Librerías externas (`react`, `react-native`, `expo-*`, `clsx`, …).
2. Paquetes del monorepo (`@km0lab/ui`, `@km0lab/app`, `@km0lab/web-theme`).
3. Imports relativos (`./...`, `../...`).
4. Tipos con `import type` (al final de cada bloque si aplica).

ESLint aplica esta regla; no la sobreescribas.

---

## 8. Git y commits

### 8.1. Modelo de ramas (GitFlow ligero)

El repo sigue un GitFlow ligero, sin release branches ni hotfix branches:

- **`main`** → estado estable / desplegado en producción. **Solo recibe
  merges desde `develop`** cuando se decide release. Nunca commits directos.
- **`develop`** → rama de integración. Aquí se acumulan los cambios
  revisados pero aún no liberados a producción.
- **`feature/*` · `refactor/*` · `fix/*` · `docs/*` · `chore/*` · `perf/*`
  · `test/*`** → ramas de trabajo cortas. **Salen siempre de `develop`** y
  mergean a `develop` vía PR.

Reglas:

- Antes de empezar trabajo:
  ```
  git checkout develop && git pull && git checkout -b <tipo>/<descripcion-corta>
  ```
- Los PR siempre apuntan a `develop`, nunca a `main`.
- Los nombres de rama van en `kebab-case` tras el `/`
  (`refactor/flatten-language-selection`, `feature/postal-code-screen`).
- Una rama = un propósito. Si en mitad del trabajo aparece otra cosa, se
  abre rama nueva.
- El merge de `develop` → `main` es **decisión humana explícita**; ningún
  agente lo hace de forma automática.
- `main` debería estar protegida en GitHub (Settings → Branches): sin push
  directo, sin force-push, solo merges desde `develop`.

### 8.2. Conventional Commits

Formato obligatorio:

```
<type>(<scope>)!: <subject>
```

- **Tipos**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- **scope** (opcional): en `kebab-case` (`ui`, `km0lab`, `app`, `web-theme`,
  `eslint-config`, `repo`, `agents`…).
- **subject**: imperativo, minúsculas, sin punto final, **máximo 50 caracteres**.
- Rompedores: añadir `!` y `BREAKING CHANGE:` en el cuerpo.
- Referencias a issues: `Refs #123` / `Closes #456` en footer.

Ejemplos válidos:

- `feat(ui): añade componente avatar`
- `fix(km0lab): corrige safe area en home`
- `docs(agents): actualiza reglas de estilos`
- `refactor(app): simplifica capa de fetch`

### 8.3. Reglas extra

- No edites `git config` global.
- No uses `--amend` ni `--force` salvo petición explícita.
- No hagas push a `main` bajo ninguna circunstancia.
- No hagas push a `develop` bajo ninguna circunstancia: siempre vía PR
  desde una rama de trabajo.

## 9. Antes de cerrar una tarea

Checklist obligatorio antes de pedir merge / terminar la tarea:

- [ ] `npx turbo run type:check lint` sin errores.
- [ ] `pnpm --filter km0lab build:web` en verde si tocaste UI o rutas.
- [ ] Componentes nuevos exportados desde `packages/components/index.ts`.
- [ ] Sin estilos inline ni clases arbitrarias.
- [ ] Nombres de archivo y carpeta siguiendo esta guía.
- [ ] Commit Conventional con subject ≤ 50 caracteres.
- [ ] Nada de secretos en ficheros commiteados (`.env*.local` están ignorados).

---

## 10. Qué NO hacer

- No copiar componentes “en masa” desde otros repos sin entender sus dependencias.
- No introducir una librería nueva sin justificación (peer weight, tamaño del
  bundle, mantenimiento). Preferir lo que ya existe.
- No mezclar sistemas de estilos (p. ej. StyleSheet.create + Tailwind).
- No usar colores en hex o rgb en el markup; siempre tokens.
- No romper la regla de solo dos entornos (`development`, `production`).
- No crear documentación nueva en `.md` si no se pide.
