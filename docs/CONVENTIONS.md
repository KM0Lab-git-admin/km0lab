# Convenciones del monorepo km0lab

Este documento complementa a `AGENTS.md` con detalles, ejemplos y la tabla
completa de breakpoints. Pensado para personas y para agentes de IA.

> Stack real de `apps/km0lab`: **Vite + React 19 + TypeScript + React Router
> DOM v7 + Tailwind v3 + shadcn/ui + Capacitor**. (El repo migró en su día de
> Expo + React Native + NativeWind a este stack; si ves referencias antiguas a
> Expo/RN, están obsoletas.)

---

## 1. Estructura de carpetas

```
km0lab/
├── AGENTS.md
├── docs/
│   └── CONVENTIONS.md
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json          # paths @km0lab/* compartidos
├── tsconfig.json
├── apps/
│   ├── km0lab/                 # app principal (Vite + React 19 + Capacitor)
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── App.tsx         # rutas (React Router DOM v7)
│   │   │   ├── main.tsx        # entrypoint
│   │   │   ├── pages/          # una pantalla = un archivo PascalCase
│   │   │   ├── components/     # componentes específicos de la app
│   │   │   ├── contexts/       # p. ej. LangContext
│   │   │   ├── locales/        # i18n
│   │   │   ├── assets/         # binarios sincronizados desde Lovable
│   │   │   └── styles/global.css
│   │   ├── env/               # .env.development, .env.production
│   │   ├── vite.config.ts
│   │   ├── capacitor.config.ts
│   │   ├── postcss.config.js
│   │   └── tailwind.config.js
│   └── km0lab-back-office/    # stub (el backoffice real es el repo km0lab-backoffice)
└── packages/
    ├── app/                    # @km0lab/app (lógica compartida)
    ├── components/             # @km0lab/ui (UI compartida)
    │   ├── icons/
    │   ├── lib/
    │   └── ui/
    ├── km0lab-web-theme/       # @km0lab/web-theme (tokens para apps web)
    ├── e2e/                    # @km0lab/e2e (Playwright)
    ├── eslint-config/
    └── jest-config/
```

---

## 2. Scripts disponibles

**Raíz**

```bash
pnpm install
pnpm dev                     # arranca apps/km0lab (Vite dev server)
npx turbo run build
npx turbo run type:check
npx turbo run lint
npx turbo run lint:fix
pnpm format
pnpm validate                # type:check + lint + format:check
```

**`apps/km0lab`**

```bash
pnpm --filter km0lab dev         # vite (env development)
pnpm --filter km0lab build       # vite build (env production)
pnpm --filter km0lab type:check  # tsc --noEmit
pnpm --filter km0lab lint        # eslint
# Capacitor (builds móviles):
pnpm --filter km0lab cap:sync
pnpm --filter km0lab cap:open:android
pnpm --filter km0lab cap:build:android  # build web + cap sync
pnpm --filter km0lab cap:apk:android    # ./gradlew assembleRelease (APK)
pnpm --filter km0lab cap:aab:android    # ./gradlew bundleRelease (AAB)
```

Entornos definidos en `apps/km0lab/env/.env.development` y
`apps/km0lab/env/.env.production`. Las variables expuestas al cliente deben
empezar por `VITE_` (Vite solo inyecta esas en el bundle).

---

## 3. Añadir un componente compartido (`@km0lab/ui`)

1. Crear archivo en `packages/components/ui/<nombre-kebab>.tsx`.
2. Usar `cn()` de `@km0lab/ui/lib/utils` para merge de clases.
3. Definir variantes con `class-variance-authority` (patrón shadcn).
4. Exportar desde `packages/components/index.ts`.
5. Si introduce nuevas dependencias, añadirlas en
   `packages/components/package.json` con la versión compatible.
6. Validar:
   ```bash
   npx turbo run type:check lint
   pnpm --filter km0lab build
   ```

Regla de oro: si el componente solo se usa en una pantalla concreta, **no**
lo metas en `@km0lab/ui`; déjalo en `apps/km0lab/src/components/...`.

---

## 4. Añadir una pantalla

1. Crear `apps/km0lab/src/pages/<NombrePascal>.tsx` (export default).
2. Declarar la ruta en `apps/km0lab/src/App.tsx` con `<Route>` (path en
   `kebab-case`). Layout compartido: envolver en `<BrandedFrame>` o componer.
3. Contemplar los cuatro estados:
   - Loading (normalmente `Skeleton`).
   - Empty (componente o bloque con CTA).
   - Error (mensaje semántico + CTA reintentar).
   - Feliz.
4. Navegar con React Router DOM (`useNavigate`, `<Link>`, `useParams`).
5. Copy vía i18n (`useLang()` / diccionario); **no** hardcodear en `@km0lab/ui`.
6. Si necesita un componente nuevo reutilizable, seguir sección 3.

Plantilla mínima:

```tsx
import { useNavigate } from 'react-router-dom'

import { Button } from '@km0lab/ui'

export default function ExampleScreen() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Título de la pantalla
      </h1>
      <Button onClick={() => navigate('/')}>Continuar</Button>
    </div>
  )
}
```

---

## 5. Estilos, tokens y breakpoints

### 5.1. Tokens de color

Definidos como variables HSL en `apps/km0lab/src/styles/global.css` y mapeados
en `apps/km0lab/tailwind.config.js`. Siempre usa los alias semánticos:

- `background`, `foreground`
- `muted`, `muted-foreground`
- `card`, `card-foreground`
- `primary`, `primary-foreground`, `primary-active`, `primary-subtle`,
  `primary-muted`, `primary-accent`, `primary-accent-muted`, `primary-contrast`
- `secondary`, `secondary-foreground`, `secondary-active`, `secondary-subtle`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`, `destructive-subtle`
- `success`, `success-foreground`
- `info`, `info-foreground`
- `warning`, `warning-foreground`
- `purple`, `purple-foreground`
- `border`, `input`, `placeholder`, `ring`, `inverse`

Para añadir un token nuevo:

1. Declarar variable en `:root` de `global.css` (`--mi-token: 200 50% 40%;`).
2. Mapear en `tailwind.config.js` (`miToken: 'hsl(var(--mi-token))'`).
3. Consumir con la clase (`bg-miToken`, `text-miToken`, ...).

### 5.2. Tipografías

Declaradas en `theme.extend.fontFamily`. Clases útiles:

- `font-sans`
- `font-sans-medium`
- `font-sans-italic`
- `font-sans-semibold`
- `font-sans-bold`

Cuando se incorporen fuentes reales de marca, reemplazar los valores en
`tailwind.config.js` y cargar las fuentes vía CSS (`@font-face` en
`global.css`, con los ficheros en `src/assets/fonts/`).

### 5.3. Breakpoints oficiales

Conviene separar dos conceptos que comparten nombre pero son distintos:

#### 5.3.1. Breakpoints CSS (rangos)

Definidos en `apps/km0lab/tailwind.config.js` (sección `theme.extend.screens`).
Cubren rangos amplios de viewport. Cualquier resolución cae siempre en
exactamente un breakpoint (no hay "tierra de nadie"):

| Breakpoint           | Media query                                        |
| -------------------- | -------------------------------------------------- |
| `vertical-mobile`    | `(orientation: portrait) and (max-width: 767px)`   |
| `vertical-tablet`    | `(orientation: portrait) and (min-width: 768px)`   |
| `horizontal-mobile`  | `(orientation: landscape) and (max-width: 1279px)` |
| `horizontal-desktop` | `(orientation: landscape) and (min-width: 1280px)` |

Se aplican vía clases Tailwind:

```tsx
<div className="py-2 vertical-tablet:py-6" />
<div className="hidden horizontal-mobile:flex horizontal-desktop:flex" />
```

#### 5.3.2. Resoluciones canónicas de validación visual (Playwright)

Los cuatro puntos exactos contra los que se diseña la maqueta y se valida
con Playwright. Cada uno está dentro del rango de su breakpoint:

| Breakpoint           | Resolución canónica |
| -------------------- | ------------------- |
| `vertical-mobile`    | 375 × 667           |
| `vertical-tablet`    | 768 × 1024          |
| `horizontal-mobile`  | 667 × 375           |
| `horizontal-desktop` | 1280 × 550          |

La maqueta se piensa en estos cuatro puntos. Los estilos cubren los rangos
completos para que usuarios reales con resoluciones intermedias (p. ej.
1366 × 768, 1440 × 900) también se vean bien.

Lovable y producción comparten la misma definición de breakpoints CSS para
que la maquetación visual de Lovable coincida con lo que renderiza
producción y lo que valida Playwright.

---

## 6. Accesibilidad mínima

- Elementos interactivos deben ser accesibles: `<Button>` de `@km0lab/ui` ya
  aplica el rol correcto; si creas otro interactivo, usa el elemento semántico
  (`<button>`, `<a>`) o añade `role`.
- Estados `disabled`, `loading` y `focus` visibles (usar `focus-visible:...`).
- Textos con contraste (usa tokens `foreground` sobre `background`; `muted-foreground`
  sobre `muted`; `primary-foreground` sobre `primary`).
- No usar color como único canal de información (acompañar con icono o texto).

---

## 7. Testing

- Framework compartido: **Jest** (`@km0lab/jest-config`, jsdom +
  `@testing-library/react`).
- Tests unitarios **colocalizados** junto al archivo: `Widget.test.tsx`.
- E2E / visual: paquete `@km0lab/e2e` (Playwright). Smoke de idiomas:
  `pnpm --filter @km0lab/e2e qa:lang`; visual: `visual:language`,
  `visual:onboarding`.

Ejecutar:

```bash
pnpm --filter <pkg> test
```

---

## 8. Commits y ramas

Ver reglas completas en `AGENTS.md` sección 8.

Sugerencias de scopes ya usados:

- `ui` → cambios en `@km0lab/ui`.
- `km0lab` → cambios en la app principal.
- `app` → cambios en `@km0lab/app`.
- `web-theme` → cambios en `@km0lab/web-theme`.
- `eslint-config`, `jest-config`.
- `agents`, `docs` → para documentación.

Flujo de rama (GitFlow ligero, ver `AGENTS.md` §8.1):

1. Crear rama desde **`develop`** con nombre descriptivo en `kebab-case`
   (`feat/home-screen`, `fix/button-disabled-color`).
2. Commits pequeños y Conventional.
3. Antes de merge: `pnpm validate` completo.
4. PR a **`develop`** cuando el checklist de `AGENTS.md` §9 esté verde. El
   merge `develop` → `main` es una decisión humana explícita.

---

## 9. Glosario rápido

- **Token semántico**: variable CSS / clase Tailwind con nombre por
  **función** (`primary`, `destructive`, `muted`), no por color real.
- **Frontera** (Lovable ↔ producción): regla que separa lo que se hace contra
  mocks en Lovable de lo que se implementa de verdad en producción. Ver
  `docs/PORTING-FROM-LOVABLE.md`.
- **sync:lovable**: script que porta mecánicamente el código de Lovable al
  monorepo de producción (`scripts/sync-lovable.mjs` + `lovable-manifest.json`).
- **Capacitor**: envoltorio que empaqueta la app web como app nativa
  iOS/Android. Los shells nativos se generan bajo demanda con `cap:add:*`.

---

## 10. Dudas habituales

**¿Cuándo creo un componente en `@km0lab/ui` y cuándo en la app?**
Si se usa en ≥ 2 pantallas o es claramente reutilizable → `@km0lab/ui`.
Si es específico de una pantalla → `apps/km0lab/src/components/...`.

**¿Puedo usar un color hex puntual?**
No. Define token primero, úsalo luego.

**¿Puedo meter `<img src="data:..." />` gigante en el repo?**
No. Assets binarios grandes no. Usar `src/assets/` (import ES module) o
`public/` con nombres en `kebab-case`; los que vienen de Lovable, vía
`pnpm sync:assets`.

**¿Cómo añado una dependencia a solo un paquete?**

```bash
pnpm --filter @km0lab/ui add <dep>
pnpm --filter km0lab add <dep>
```
