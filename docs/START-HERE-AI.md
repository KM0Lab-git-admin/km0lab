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
El contrato completo (portar todo lo portable, no machacar lógica
real, fixes UI primero en Lovable) está en §12.0.

**Diseño y producto:** 5. `docs/DESIGN-SYSTEM.md` — design system + catálogo de componentes +
identidad visual, para pasar a cualquier IA. Se regenera con
`pnpm design:doc` (fuente: `packages/app/design-system/`). 6. `docs/BRIEF-HOME.md` — brief reutilizable para proponer pantallas. 7. `docs/spec-home-c.md` — spec de la Home en construcción (variant C).

**Backend (datos, auth):** 8. `docs/BACKEND.md` — arquitectura de los
dos backends (events-query solo lectura + km0lab-api usuarios/auth),
modelo de datos y flujo de auth OTP. El código de km0lab-api tiene su
propio `README.md`.

**Entornos y DNS:** 9. `docs/ENVIRONMENTS.md` — local / UAT / prod,
subdominios (`app.uat`, `api.uat`, `eventquery.uat`), ramas
(`develop` → UAT, `main` → prod) y pasos Vercel / Railway.

**Para trabajar con Product Owner / diseño (no técnicos):** 10. `docs/PROMPTS-PO.md` — plantilla de prompts no técnicos.

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

El frontend de Lovable está sincronizado al monorepo vía
`pnpm sync:lovable` con inventario completo en
`scripts/lovable-manifest.json` (contrato §12.0 de
`docs/PORTING-FROM-LOVABLE.md`). La app **compila a producción**
(`pnpm --filter km0lab build` verde). Rama de integración: `develop`.

**Hecho (en `develop`):**

- **Pantallas portadas** (`apps/km0lab/src/pages`): Language (vía Index),
  Onboarding, PostalCode, Home (guest/registrado), Login, CheckEmail,
  Profile, Agenda, Noticias, Evento. Rutas en `apps/km0lab/src/App.tsx`.
  `EventosHoy` se eliminó (Lovable ya no la tiene).
- **Componentes** (~30) y **lógica compartida** en `@km0lab/app`: i18n,
  `LangContext`, store Zustand (`useAppStore` con token JWT +
  `notificationsLastSeenAt`), hooks (`useAuth`, `useProfile`,
  `useNotifications`, `useFeaturedPromos`, breakpoints), types y data.
  Primitivos en `@km0lab/ui`.
- **Backend real (km0lab-api)**: `km0labClient`, `auth`, `profile`
  locked en el manifest. Base URL en `VITE_KM0LAB_API_URL`.
- **events-query**: `apiSchemas`/`eventsApi`/`newsApi` sincronizados;
  `apiClient` locked (pega a `VITE_EVENTS_API_URL`, sin proxy Supabase).
- **Onboarding**: imágenes locales en `src/assets/onboarding/*.jpg`
  (vía `pnpm sync:assets`). El idioma se lee del store (`useLang`).
- **Smoke idiomas**: `pnpm --filter @km0lab/e2e qa:lang` (ca/es/en).

**Pendiente:**

- **Chat** (pantalla + `chatMachine` + `VoiceRecorder` + query NL):
  aparcado; quedan fuera del sync.
- **Smoke-test del login OTP end-to-end**: requiere km0lab-api en local.
- **Deploy**: web a Vercel (`VITE_*` en dashboard); km0lab-api a
  Railway (cuenta, SMTP real y dominio). Capacitor/Android: shells
  nativos, firma y Play Console (iOS diferido).
- **QA visual** en las 4 resoluciones canónicas vs. Lovable publicado
  (`pnpm --filter @km0lab/e2e visual:language|visual:onboarding`).

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
