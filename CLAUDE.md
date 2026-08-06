# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Nuevo en el proyecto: empieza por [`docs/START-HERE-AI.md`](docs/START-HERE-AI.md)
> (onboarding para agentes) o [`docs/PROYECTO-GLOBAL.md`](docs/PROYECTO-GLOBAL.md)
> (visión global del ecosistema de siete repos, flujo Lovable ↔ producción).
> Las reglas vinculantes están en [`AGENTS.md`](AGENTS.md) y prevalecen sobre
> este archivo.

## Package Manager & Monorepo

This is a **pnpm + Turbo** monorepo. Always use `pnpm` (not npm or yarn). Turbo orchestrates tasks across workspaces.

```bash
pnpm install          # install all dependencies
pnpm dev              # start apps/km0lab (Vite dev server)
pnpm build            # build all packages via Turbo
pnpm validate         # type:check + lint + format:check (run before committing)
pnpm lint:fix         # auto-fix ESLint issues
pnpm format           # format with Prettier
pnpm sync:lovable     # portar código desde el repo de Lovable (ver docs)
pnpm sync:assets      # sincronizar assets binarios desde Lovable
pnpm design:doc       # regenerar docs/DESIGN-SYSTEM.md
```

## Workspaces

| Path                        | Package                 | Description                                                          |
| --------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `apps/km0lab`               | —                       | App principal cross-platform (Vite + React 19 + Capacitor)           |
| `packages/components`       | `@km0lab/ui`            | Librería de UI compartida (primitivos shadcn)                        |
| `packages/app`              | `@km0lab/app`           | Lógica compartida (hooks, services, stores, machines, design-system) |
| `packages/km0lab-web-theme` | `@km0lab/web-theme`     | Tokens CSS/Tailwind para apps web                                    |
| `packages/eslint-config`    | `@km0lab/eslint-config` | Config ESLint flat compartida                                        |
| `packages/jest-config`      | `@km0lab/jest-config`   | Config Jest compartida                                               |

## Main App (apps/km0lab)

```bash
pnpm --filter km0lab dev          # Vite dev server (env development)
pnpm --filter km0lab build        # build de producción a apps/km0lab/dist
pnpm --filter km0lab type:check   # TypeScript check de esta app
pnpm --filter km0lab lint         # ESLint de esta app
# Capacitor (builds móviles; los shells nativos NO existen hasta ejecutar cap:add):
pnpm --filter km0lab cap:add:android
pnpm --filter km0lab cap:add:ios
pnpm --filter km0lab cap:sync
```

Entornos en `apps/km0lab/env/` (`.env.development`, `.env.production`). Solo
existen esos dos entornos.

## Technology Stack

- **Vite** + **React 19** + **TypeScript ~5.9** (strict, target ES2022)
- **Tailwind CSS v3** + **shadcn/ui** (primitivos sobre **Radix**)
- **React Router DOM v7** — rutas declaradas en `apps/km0lab/src/App.tsx`
- **Framer Motion** (animaciones) · **lucide-react** (iconos)
- **@tanstack/react-query** (datos remotos) · **zustand** (estado global) ·
  **xstate** (máquinas de estado) · **react-hook-form** + **zod** (formularios)
- **class-variance-authority (CVA)** — patrón de variantes en `@km0lab/ui`
- **Capacitor** — builds iOS/Android (shells nativos bajo demanda)

## UI Component Library (@km0lab/ui)

Los primitivos viven en `packages/components/ui/` (kebab-case, estilo shadcn):

- Variantes con CVA; estilos en strings `className`.
- `cn()` de `@km0lab/ui` (clsx + tailwind-merge) para fusionar clases.
- Iconos: `interopIcon` centralizado en `lib/utils`.

Cada componente nuevo se exporta desde `packages/components/index.ts`.

## Styling Conventions

- Clases utilitarias de Tailwind; nada de StyleSheet.
- Tokens semánticos como variables CSS en `apps/km0lab/src/styles/global.css`,
  mapeados en `apps/km0lab/tailwind.config.js`. Prohibido hex/rgb crudos.
- Breakpoints semánticos (`vertical-mobile:`, `vertical-tablet:`,
  `horizontal-mobile:`, `horizontal-desktop:`). Ver `docs/CONVENTIONS.md`.
- Prettier: sin punto y coma, 2 espacios, 80 cols, comas trailing (es5).

## TypeScript Path Aliases

En `tsconfig.base.json`:

- `@km0lab/ui` → `packages/components`
- `@km0lab/app` → `packages/app`

## ESLint

ESLint 9 flat config. Config compartida en `packages/eslint-config/`. Cada
workspace la extiende. `pnpm lint:fix` para auto-fix.

## Testing

Jest compartido vía `packages/jest-config/jest-preset.js` (jsdom,
`@testing-library/react`). Tests dentro de un paquete:
`pnpm --filter <package-name> test`.

## Reglas de agentes de IA

Reglas vinculantes para agentes de IA:

- [`docs/START-HERE-AI.md`](docs/START-HERE-AI.md) — punto de entrada y contexto.
- [`AGENTS.md`](AGENTS.md) — arquitectura, estilos, naming, imports, git y checklist.
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — detalles, ejemplos y breakpoints.

**Leer antes de hacer cualquier cambio.** Las reglas de `AGENTS.md` prevalecen
sobre las instrucciones por defecto.
