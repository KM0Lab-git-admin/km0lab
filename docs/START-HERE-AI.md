# START HERE — Onboarding para agentes de IA (KM0 LAB)

> Punto de entrada único para cualquier agente de IA (Claude u otro) que
> vaya a ayudar con KM0 LAB. Léelo entero primero; luego lee los
> documentos que enlaza, en el orden indicado. Después de esto tendrás el
> mismo contexto para continuar el trabajo sin que te lo expliquen desde
> cero.

## 1. Qué es KM0 LAB

App del comercio y la vida de proximidad de un municipio (piloto:
Malgrat de Mar). Conecta vecinos con comercios locales, agenda de
eventos, noticias municipales y un chat asistente con IA. Gamificación
por puntos/recompensas. Trilingüe (català por defecto, es, en). Uso
mayoritariamente móvil, portrait. Corre en web (Vercel) y móvil
(Capacitor).

## 2. Arquitectura: cuatro repositorios

| Repo                                        | Rol                                                                                             | Rama de trabajo |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------- |
| **`KM0Lab-git-admin/km0lab`**               | Monorepo de producción (pnpm + Turbo). App final + docs de proceso (fuente de verdad).          | `develop`       |
| **`KM0Lab-git-admin/speak-spanish-easily`** | Proyecto de **Lovable**: prototipado visual, source of truth de pantallas/diseño/assets.        | `main`          |
| **`KM0Lab-git-admin/events-query`**         | API de scraping (FastAPI): eventos y noticias del municipio. Solo se consume.                   | `develop`       |
| **`KM0Lab-git-admin/km0lab-api`**           | Backend de la app (FastAPI + MySQL): usuarios y auth. Lectura/escritura. Ver `docs/BACKEND.md`. | `develop`       |

Stack real de la app (`apps/km0lab`): **Vite + React 19 + Tailwind v3 +
shadcn/ui + Radix + React Router v7 + Capacitor**. (⚠️ Ver §6: el stack
de Lovable es React 18 / Router v6 — el porte lo absorbe el sync.)

## 3. El flujo de trabajo (cómo se construye una pantalla)

Prototipado en Lovable → validación con el Product Owner (por URL de
preview) → sincronización mecánica al monorepo → implementación real en
producción. La **frontera** entre Lovable y producción es la regla clave:
en Lovable vive todo lo que el usuario experimenta contra mocks o APIs
de solo lectura; en producción, todo lo que toca el mundo real (auth,
BD, secretos, lógica de negocio). El automatismo es `pnpm sync:lovable`.

## 4. Qué leer y en qué orden

**Reglas del proyecto (obligatorias antes de tocar código):**

1. `AGENTS.md` — arquitectura, naming, estilos, git, checklist de cierre.
   **Es autoritativo.** (raíz del monorepo)
2. `docs/CONVENTIONS.md` — detalles, breakpoints, ejemplos.

**El flujo Lovable ↔ producción:** 3. `docs/LOVABLE-KNOWLEDGE.md` (km0lab) = `docs/KNOWLEDGE.md`
(speak-spanish-easily) — el contrato de generación de código para
Lovable: frontera, estructura, layout portrait-first, deps aprobadas. 4. `docs/PORTING-FROM-LOVABLE.md` — cómo se portan pantallas; §12
documenta `pnpm sync:lovable` (script + manifest + candados `locked`).

**Diseño y producto:** 5. `docs/DESIGN-SYSTEM.md` — design system + catálogo de componentes +
identidad visual, para pasar a cualquier IA. Se regenera con
`pnpm design:doc` (fuente: `packages/app/design-system/`). 6. `docs/BRIEF-HOME.md` — brief reutilizable para proponer pantallas. 7. `docs/spec-home-c.md` — spec de la Home en construcción (variant C).

**Backend (datos, auth):** 8. `docs/BACKEND.md` — arquitectura de los
dos backends (events-query solo lectura + km0lab-api usuarios/auth),
modelo de datos y flujo de auth OTP. El código de km0lab-api tiene su
propio `README.md`.

**Para trabajar con Product Owner / diseño (no técnicos):** 9. `docs/PROMPTS-PO.md` — plantilla de prompts no técnicos.

**Prompts operativos** (en el repo de Lovable, `docs/`):
`PROMPT-home-c.md`, `PROMPT-layout-portrait-first.md`.

## 5. Accesos que necesita la nueva sesión

- **GitHub**: lectura/escritura en los cuatro repos del §2 (o solo lectura
  si únicamente va a guiar/consultar). En Claude Code web, añadirlos al
  scope de la sesión.
- Ramas de trabajo del §2. Convención de commits y ramas: `AGENTS.md` §8.
- No necesita acceso a Lovable en sí: la Knowledge y los prompts viven
  en el repo `speak-spanish-easily` y se leen desde ahí.

## 6. Estado actual y deudas conocidas

El frontend de Lovable ya está portado casi por completo al monorepo y la
app **compila a producción** (`pnpm --filter km0lab build` verde). El porte
se hizo por tandas con `pnpm sync:lovable` (+ ajustes manuales) sobre la rama
`develop`; el histórico está en los commits `feat: porta …`.

**Hecho (en `develop`):**

- **Pantallas portadas** (`apps/km0lab/src/pages`): Language, Onboarding,
  PostalCode, Home (con `forceAuthState` guest/registrado), Login, CheckEmail,
  Profile, Agenda, Noticias, EventosHoy, Evento. Rutas declaradas en
  `apps/km0lab/src/App.tsx` (árbol de providers de Lovable: QueryClient →
  LangProvider → TooltipProvider → Toaster + SonnerToaster → BrowserRouter).
- **Componentes** (~30) y **lógica compartida** en `@km0lab/app`: i18n
  (`utils/i18n`), `LangContext`, store Zustand (`useAppStore`, con `token`
  JWT persistido), hooks (`useAuth`, `useProfile`, `useNotifications`,
  `use-breakpoint`, `use-mobile`), types y data. Primitivos de infra en
  `@km0lab/ui` (toast/toaster/sonner/tooltip/use-toast).
- **Backend real cableado (km0lab-api)**: `services/km0labClient` (Bearer JWT
  y validación zod), `services/auth` (OTP request/verify) y `services/profile`
  (`/users/me`) sustituyen a los mocks sin tocar pantallas. Bloqueados en
  `locked` del manifest. Base URL en `VITE_KM0LAB_API_URL`.
- **events-query**: `apiClient`/`apiSchemas`/`eventsApi`/`newsApi` portados;
  el `apiClient` pega directo a `VITE_EVENTS_API_URL` (sin el proxy Supabase
  de Lovable). Agenda/Noticias/EventosHoy/Evento consumen esos services.

**Pendiente:**

- **Chat** (pantalla + `chatMachine` + `VoiceRecorder` + `eventQueryApi`):
  aparcado a propósito; se portará más adelante.
- **Onboarding re-alineado**: la versión nueva de Lovable usa imágenes
  servidas por el CDN interno de Lovable (`src/assets/onboarding/*.asset.json`
  son punteros, no binarios), así que NO se pueden sincronizar con
  `pnpm sync:assets`. Sigue la versión antigua (basada en emojis). Para
  re-alinearla: subir esas imágenes a `speak-spanish-easily/src/assets/` como
  binarios reales y volver a portar `Onboarding.tsx` + `onboardingSlides.ts`.
- **Smoke-test del login OTP end-to-end**: requiere levantar km0lab-api en
  local (Docker/MySQL); el flujo Login→CheckEmail apunta a `localhost:8000`.
- **Deploy**: web a Vercel (poner `VITE_*` en el dashboard); km0lab-api a
  Railway (cuenta, SMTP real y dominio). Capacitor/Android: `cap:add:android`,
  firma y Play Console (iOS diferido, requiere Mac/CI macOS).
- **QA visual** en las 4 resoluciones canónicas vs. Lovable publicado (§ de
  `docs/PORTING-FROM-LOVABLE.md`) — no hecha aún (entorno sin navegador).

**Convenciones/decisiones tomadas durante el porte:**

- **Assets**: se espeja la estructura de `src/assets` de Lovable en
  `apps/km0lab/src/assets` (mismos nombres/rutas, algunos con underscore),
  porque el código portado importa esas rutas y el sync no reescribe rutas de
  assets. Se desvía del kebab de `AGENTS.md §3`; documentado en
  `scripts/assets-manifest.json`.
- **TypeScript**: `apps/km0lab` relaja `noUncheckedIndexedAccess` (ajeno a
  `strict`, no usado por Lovable) para portar accesos por índice 1:1;
  `packages/*` mantienen la estrictez plena.

**Deudas resueltas** (histórico): comentario que rompía Prettier en
`km0lab-web-theme` (arreglado; repo formateado); `env.ts` migrado a Vite
(`import.meta.env.VITE_*`); script `build:web` añadido; `dev` del root
corregido; CLAUDE.md alineado al stack real.

## 7. Prompt inicial para arrancar la nueva sesión

Pégale esto a la nueva sesión de Claude (con los cuatro repos en su scope):

> Vas a ayudarme con KM0 LAB, una app de comercio de proximidad. El
> contexto completo está versionado en el repo `KM0Lab-git-admin/km0lab`.
> Antes de nada, lee `docs/START-HERE-AI.md` y todos los documentos que
> enlaza, en el orden indicado. Tengo también los repos
> `speak-spanish-easily` (Lovable), `events-query` (API de eventos) y
> `km0lab-api` (backend de la app) en el scope.
> Cuando termines, hazme un resumen de en qué punto está el proyecto y
> qué crees que es lo siguiente, y seguimos desde ahí.
