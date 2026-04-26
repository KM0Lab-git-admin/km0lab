# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager & Monorepo

This is a **pnpm + Turbo** monorepo. Always use `pnpm` (not npm or yarn). Turbo orchestrates tasks across workspaces.

```bash
pnpm install          # install all dependencies
pnpm dev              # start km0lab web only (fast path)
pnpm dev:all          # start all dev servers in parallel
pnpm build            # build all packages
pnpm validate         # type:check + lint + format:check (run before committing)
pnpm lint:fix         # auto-fix ESLint issues
pnpm format           # format with Prettier
```

## Workspaces

| Path | Package | Description |
|------|---------|-------------|
| `apps/km0lab` | — | Main cross-platform app (Expo + React Native) |
| `apps/km0lab-back-office` | — | Back-office web app (pending Vite migration) |
| `packages/components` | `@km0lab/ui` | Shared UI component library |
| `packages/app` | `@km0lab/app` | Shared app logic and features |
| `packages/km0lab-web-theme` | `@km0lab/web-theme` | CSS/Tailwind v4 tokens for web apps |
| `packages/eslint-config` | `@km0lab/eslint-config` | Shared ESLint flat config |
| `packages/jest-config` | `@km0lab/jest-config` | Shared Jest configuration |

## Main App (apps/km0lab)

```bash
pnpm dev              # start Expo dev server
pnpm web              # run web version via Metro
pnpm android          # build/run Android
pnpm ios              # build/run iOS
pnpm type:check       # TypeScript check for this app only
pnpm lint             # ESLint this app only
pnpm build:web        # export web build to dist/
```

Environment files live in `apps/km0lab/env/` (`.env.development`, `.env.production`). The `APP_ENV` variable switches config including bundle ID, app name, and API URL.

## Technology Stack

- **React 19** + **React Native 0.83** via **Expo ~55** (managed workflow)
- **expo-router** — file-based routing under `apps/km0lab/app/`
- **NativeWind 4** — Tailwind CSS for React Native; use `className` props
- **TypeScript ~5.9** — strict mode, target ES2022
- **class-variance-authority (CVA)** — component variant patterns in `@km0lab/ui`

## UI Component Library (@km0lab/ui)

Components live in `packages/components/src/`. Each component follows this pattern:

- Variants defined with CVA, styles in `className` strings
- `cn()` utility (clsx + tailwind-merge) for merging class names
- Icons use `interopIcon()` to adapt Lucide icons for NativeWind
- Supports both React Native and web via NativeWind platform prefixes (`web:`, `native:`)

When adding a new component, export it from `packages/components/src/index.ts`.

## Styling Conventions

- Tailwind utility classes via NativeWind — no separate StyleSheet objects
- Semantic color tokens defined in `apps/km0lab/global.css` as CSS variables and mirrored in `tailwind.config.js`
- Web theme tokens for Next.js/Vite apps live in `packages/km0lab-web-theme`
- Prettier config: no semicolons, 2-space indent, 80-char line width, trailing commas (es5)

## TypeScript Path Aliases

Defined in `tsconfig.base.json`:
- `@km0lab/ui` → `packages/components`
- `@km0lab/app` → `packages/app`

## ESLint

Uses ESLint 9 flat config format. The shared config is in `packages/eslint-config/`. Each workspace extends it. Run `pnpm lint:fix` to auto-fix.

## Testing

Jest config shared via `packages/jest-config/jest-preset.js` (jsdom environment, `@testing-library/react`). Run tests inside a specific package with `pnpm --filter <package-name> test`.

## Reglas de agentes de IA

Este proyecto tiene reglas vinculantes para agentes de IA en dos archivos:

- [`AGENTS.md`](AGENTS.md) — reglas de arquitectura, estilos, naming, imports y checklist de cierre.
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — detalles, ejemplos y tabla de breakpoints.

**Leer ambos antes de hacer cualquier cambio.** Las reglas de `AGENTS.md` prevalecen sobre las instrucciones por defecto.
