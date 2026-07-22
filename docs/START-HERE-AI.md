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

**Para trabajar con Product Owner / diseño (no técnicos):** 8. `docs/PROMPTS-PO.md` — plantilla de prompts no técnicos.

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

- **En curso**: construcción de la Home "variant C" en Lovable por la
  secuencia de 3 prompts de `docs/spec-home-c.md`. Portrait cerrado;
  regla de layout portrait-first recién añadida para arreglar
  landscape/tablet.
- **Contrato de API** de events-query ya está en Lovable
  (`src/services/apiClient|apiSchemas|eventsApi|newsApi.ts`,
  `src/data/fixtures/`) — verificado contra la API real. NO tocar.
- **Backend de la app**: definido en `docs/BACKEND.md` y scaffoldeado en
  el repo `km0lab-api` (FastAPI + MySQL, auth OTP email). Alcance MVP:
  solo usuarios; puntos/QR/comercios/recompensas mockeados en la app.
- **Deuda 2**: `packages/km0lab-web-theme/tailwind.config.js` tiene un
  comentario que rompe el parser de Prettier (falla `pnpm format:check`
  del repo entero). Ajeno a los cambios de proceso.
- ~~Deuda 1 (CLAUDE.md stack Expo)~~ — RESUELTA: CLAUDE.md alineado con
  el stack real (Vite/React/Capacitor).
- ~~Deuda 3 (events-query 500 + CORS)~~ — RESUELTA: `/api/v1/events` y
  `/news` responden 200 y el CORS para dominios de Lovable está
  desplegado. La Agenda ya consume el endpoint de lista real.

## 7. Prompt inicial para arrancar la nueva sesión

Pégale esto a la nueva sesión de Claude (con los tres repos en su scope):

> Vas a ayudarme con KM0 LAB, una app de comercio de proximidad. El
> contexto completo está versionado en el repo `KM0Lab-git-admin/km0lab`.
> Antes de nada, lee `docs/START-HERE-AI.md` y todos los documentos que
> enlaza, en el orden indicado. Tengo también los repos
> `speak-spanish-easily` (Lovable), `events-query` (API de eventos) y
> `km0lab-api` (backend de la app) en el scope.
> Cuando termines, hazme un resumen de en qué punto está el proyecto y
> qué crees que es lo siguiente, y seguimos desde ahí.
