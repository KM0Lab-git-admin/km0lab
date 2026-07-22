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

**Hecho / en marcha:**

- **Home "variant C"** en construcción en Lovable por la secuencia de
  `docs/spec-home-c.md`. La estructura y los dos estados (guest/
  registered) están montados; confirmar con el humano el punto exacto de
  los pasos 2 (PointsCard evolucionada, reward-welcome) y 3 (estados
  forzables por query param).
- **Reglas de layout** ya en KNOWLEDGE.md §3 y aplicadas: columna
  portrait-first centrada; desktop = teléfono centrado (DeviceShell, no
  layout desktop propio); validación portrait "en horquilla" (375×667 +
  390×844). PreviewAll reducido en consecuencia.
- **Agenda conectada a datos reales**: consume el endpoint de lista de
  events-query (`GET /api/v1/events`) vía `services/eventsApi.listEvents`.
- **Contrato de API** de events-query en Lovable
  (`src/services/apiClient|apiSchemas|eventsApi|newsApi.ts`,
  `src/data/fixtures/`) — verificado contra la API real. NO tocar.
- **Backend de la app**: definido en `docs/BACKEND.md` y scaffoldeado en
  `km0lab-api` (FastAPI + MySQL, auth OTP email). MVP: solo usuarios;
  puntos/QR/comercios/recompensas mockeados en la app.

**⚠️ Tarea grande pendiente — portar TODO el frontend de Lovable:**

El monorepo de producción solo tiene una fracción del frontend portada.
La mayor parte de la app vive HOY solo en Lovable y hay que traerla al
monorepo vía `pnpm sync:lovable`. Estado (aprox.):

|                              | Producción (`apps/km0lab`)           | Lovable | Falta portar                                                                  |
| ---------------------------- | ------------------------------------ | ------- | ----------------------------------------------------------------------------- |
| Pantallas de producto        | 3 (Language, Onboarding, PostalCode) | ~13     | Home, Chat, Agenda, Noticias, EventosHoy, Login, CheckEmail, Evento, Profile… |
| Componentes                  | 4                                    | ~30     | la mayoría                                                                    |
| Primitivos ui (`@km0lab/ui`) | 11                                   | 49      | ~38                                                                           |

El `sync:lovable` **nunca se ha ejecutado de verdad** (el
`scripts/lovable-manifest.json` está vacío). Portar el frontend completo
—declarando los archivos en el manifest y corriendo el sync por tandas,
según `docs/PORTING-FROM-LOVABLE.md` §12— es LA tarea principal de la
fase de producción. No se sincronizan las piezas solo-Lovable (preview
harness, `integrations/`, `design-system/`); ver KNOWLEDGE.md §0.

**Otros próximos pasos (el humano prioriza):**

- Conectar la app a `km0lab-api` (capa de service + JWT en el store, en
  sustitución de `services/mock/auth.ts`).
- SMTP real para OTP y despliegue de km0lab-api en Railway.
- Capacitor: generar shells nativos y builds para stores.

**Deuda abierta:**

- `packages/km0lab-web-theme/tailwind.config.js` tiene un comentario que
  rompe el parser de Prettier (falla `pnpm format:check` del repo
  entero). Ajeno a los cambios de proceso.

**Deudas resueltas** (histórico): CLAUDE.md alineado al stack real;
events-query `/events` y `/news` responden 200 y su CORS para Lovable
está desplegado.

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
