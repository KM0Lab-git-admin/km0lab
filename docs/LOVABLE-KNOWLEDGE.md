# Knowledge de Lovable — contrato de generación de código

> **Qué es esto**: las reglas que la IA de Lovable debe cumplir para que
> TODO el código que genere sea sincronizable automáticamente con el
> monorepo de producción `km0lab` mediante `pnpm sync:lovable` (ver
> `docs/PORTING-FROM-LOVABLE.md` §12), sin retoques manuales ni
> conflictos.
>
> **Cómo se instala** (el campo Knowledge de Lovable admite máx. 10.000
> caracteres, así que el contrato completo NO cabe pegado):
>
> 1. El contrato completo (todo lo que sigue a `=== KNOWLEDGE ===`) vive
>    **dentro del repo de Lovable** como `docs/KNOWLEDGE.md`, donde su IA
>    puede leerlo. Cuando cambie este archivo, replicar el cambio allí
>    **en el mismo PR** (mismo cuerpo, con su cabecera propia).
> 2. En `Settings → Knowledge` del proyecto de Lovable se pega SOLO el
>    **bloque compacto** de la sección siguiente, que resume las reglas
>    críticas y ordena leer `docs/KNOWLEDGE.md` y
>    `src/design-system/tokens.ts` (el design system ya vive en el repo
>    de Lovable; no hace falta pegar el prompt pack).
>
> **Recuerda** (lección de `PORTING-FROM-LOVABLE.md` §9): la Knowledge es
> declarativa, no una garantía. El automatismo de sync verifica el código
> real; si Lovable incumple una regla, el sync lo reporta como error.

---

## Bloque compacto para el campo Knowledge (≤10k caracteres)

```
Eres el entorno de prototipado de KM0 LAB. Tu código NO es desechable:
se sincroniza automáticamente con el monorepo de producción. Las reglas
completas y VINCULANTES están en docs/KNOWLEDGE.md de este repo: léelas
antes de generar o modificar código y cúmplelas literalmente. El design
system (tokens, breakpoints) está en src/design-system/tokens.ts.

Reglas críticas (resumen; ante conflicto manda docs/KNOWLEDGE.md):
1. Frontera: aquí vive lo que el usuario experimenta, con mocks o APIs
   de solo lectura. Nada de secretos, escrituras a backends, auth real
   ni BD. Ante la duda, deja la firma mock y avísame en el chat.
2. Estructura fija de src/: pages/, components/ (+ ui/), hooks/,
   services/, data/ (+ fixtures/), stores/, machines/, contexts/,
   types/, lib/i18n.ts, assets/. No crees carpetas nuevas de primer
   nivel.
3. Estilos: SOLO tokens semánticos o paleta km0-*; prohibido hex/rgb y
   estilos inline estáticos. Breakpoints: solo vertical-mobile:,
   vertical-tablet:, horizontal-mobile:, horizontal-desktop:. Valida en
   375x667, 768x1024, 667x375 y 1280x550.
4. Componentes presentacionales, sin fetch: datos vía services tipados
   (mock o API read-only validada con zod). Estado global en stores/
   (Zustand), flujos complejos en machines/ (XState), datos remotos con
   React Query. Toda pantalla implementa 4 estados:
   loading/empty/error/feliz.
5. Copy SOLO en lib/i18n.ts ({ ca, es, en }); nunca strings en JSX ni
   copy en components/ui/.
6. Imports siempre con @/; primitivos ui archivo a archivo
   (@/components/ui/button), nunca barrels.
7. INTOCABLES: lib/utils.ts, tailwind.config.ts, tokens existentes de
   index.css, la API de los primitivos ui existentes, vite.config, y el
   contrato de API verificado (services/apiClient.ts, apiSchemas.ts,
   eventsApi.ts, newsApi.ts, data/fixtures/*): si falta un dato, pídelo
   en el chat, no cambies los schemas.
8. Dependencias: solo la lista aprobada de docs/KNOWLEDGE.md §8;
   cualquier otra requiere aprobación humana en el chat.
9. Piezas solo-Lovable, jamás importadas desde código de producto:
   src/integrations/, supabase/, src/design-system/, PreviewAll,
   DesignSystem, Components, DeviceShell, SimulatedDevice.
10. Antes de dar una pantalla por terminada, pasa el checklist de
    docs/KNOWLEDGE.md §10.
11. Prompts no técnicos (PO/diseño): identifica tú el componente,
    reformula el cambio en una frase no técnica y espera confirmación
    antes de tocar código; solo el elemento señalado; ante decisiones
    técnicas no actúes y deriva al desarrollador (docs/KNOWLEDGE.md §9).
```

---

=== KNOWLEDGE ===

Eres el entorno de prototipado del proyecto **KM0 LAB**. El código que
generas NO es desechable: se sincroniza de forma automática con un
monorepo de producción mediante un mapping mecánico de archivos. Cada
regla de este documento existe para que esa sincronización funcione sin
intervención humana. Cúmplelas literalmente.

## 0. Frontera Lovable ↔ producción

Aquí vive todo lo que el usuario experimenta, funcionando contra
implementaciones falsas o APIs de solo lectura. En producción vive todo
lo que toca el mundo real. La prueba de fuego ante cualquier duda:

> ¿Necesita un secreto (API key privada, credencial, BD), escribe datos,
> o contiene lógica de negocio de backend? → NO se hace aquí; se deja la
> firma mock y se avisa en el chat.

**Permitido en Lovable**: pantallas y flujos completos, estado global
(Zustand), máquinas de estados (XState), validaciones de formulario,
services mock con firmas estables, y **consumo de APIs públicas de solo
lectura** (ver §6).

**Prohibido en Lovable**: escrituras contra backends reales, auth real,
acceso a BD, secretos, procesamiento de datos de negocio.

**Piezas solo-Lovable** (nunca se sincronizan; no las mezcles con código
de producto): `src/integrations/`, `supabase/`, `src/design-system/`,
las páginas `PreviewAll`, `DesignSystem` y `Components`, y los
componentes `DeviceShell` y `SimulatedDevice`.

## 1. Estructura de carpetas (contrato de sync)

Trabaja SOLO dentro de `src/` (y `supabase/` para el entorno propio de
Lovable), con esta estructura exacta:

```
src/
├── pages/          # 1 pantalla = 1 archivo PascalCase (Home.tsx)
├── components/     # componentes específicos de pantalla, PascalCase, planos
│   └── ui/         # primitivos shadcn, kebab-case (button.tsx, dialog.tsx)
├── hooks/          # hooks reutilizables (use-postal-code.ts)
├── services/       # capa de datos: mocks tipados y consumo de APIs read-only
├── data/           # datos mock y fixtures capturadas (data/fixtures/)
├── stores/         # estado global Zustand (useAppStore.ts)
├── machines/       # máquinas de estados XState (chatMachine.ts)
├── contexts/       # providers React (LangContext.tsx)
├── types/          # tipos de dominio compartidos
├── lib/i18n.ts     # diccionario de copy ca/es/en (único lugar del copy)
├── lib/utils.ts    # SOLO cn(). No añadas nada más aquí.
└── assets/         # imágenes y fuentes (kebab-case)
```

Cada carpeta tiene un destino fijo en producción; NO crees carpetas
nuevas de primer nivel ni subcarpetas en `pages/`. Los componentes de
`components/` van planos; solo agrupa en subcarpeta PascalCase cuando una
pantalla tenga varios componentes auxiliares propios.

## 2. Convenciones de nombres

- Código e identificadores **en inglés** (los nombres de dominio ya
  existentes en español — `Evento`, `Noticia` — se mantienen por
  coherencia con la API). Copy de producto SOLO en `lib/i18n.ts`.
- Pantallas y componentes de app: archivo y componente en `PascalCase`,
  `export default`.
- Primitivos de `components/ui/`: archivo `kebab-case`, **exports con
  nombre** (estilo shadcn: `export { Button, buttonVariants }`).
- Hooks: archivo `use-<nombre>.ts(x)` en kebab-case, función `useNombre`.
- Services, stores, machines y data: archivo `camelCase.ts`.
- Props y funciones: `camelCase`. Tipos exportados: `PascalCase`, sin
  prefijo `I`. Props siempre tipadas; **prohibido `any`**.
- Rutas de React Router: paths en `kebab-case` (`/postal-code`).
- Un componente por archivo; el nombre del archivo = nombre del export.

## 3. Design system y componentes compartidos

- Usa EXCLUSIVAMENTE los tokens del design system KM0 (documento anexo):
  tokens semánticos (`primary`, `foreground`, `muted`, `card`,
  `destructive`, `success`…) o paleta `km0-*`. **Prohibido** hex/rgb
  crudos y atributos de presentación. `style={{...}}` inline solo para
  valores calculados en runtime (p. ej. `animationDelay` dinámico),
  nunca para estilos estáticos.
- Antes de crear un primitivo nuevo en `components/ui/`, reutiliza los
  existentes. Composición explícita (`<Card>`, `<CardHeader>`…) antes
  que props mágicas.
- Pantallas con marca se envuelven en `<BrandedFrame>`; el chat usa su
  fullbleed propio.
- Breakpoints: usa SOLO los 4 semánticos (`vertical-mobile:`,
  `vertical-tablet:`, `horizontal-mobile:`, `horizontal-desktop:`). No
  uses `sm:`/`md:`/`lg:` ni aliases viejos (`wide-landscape:`,
  `short-landscape:`, `tablet-portrait:`) en código nuevo. No modifiques
  la definición de breakpoints: está espejada con producción y Playwright.
- Diseña y valida cada pantalla en las 4 resoluciones canónicas:
  375×667, 768×1024, 667×375 y 1280×550.
- Animaciones con Framer Motion; iconos con lucide-react.

## 4. Qué puedes modificar y qué debes conservar

**Puedes crear/modificar**: `pages/`, `components/`, `components/ui/`
(solo primitivos NUEVOS), `hooks/`, `services/` (mocks), `data/`,
`stores/`, `machines/`, `contexts/`, `types/`, `lib/i18n.ts`, `assets/`.

**Intocables** (romperías el sync o el contrato):

- `src/lib/utils.ts`.
- `tailwind.config.ts` y las variables CSS existentes de `index.css`
  (añadir un token nuevo está permitido; renombrar o borrar, no).
- Primitivos existentes de `components/ui/`: no cambies su API (props,
  exports). Extiende añadiendo variantes CVA nuevas sin romper las
  existentes.
- `vite.config.ts`, `index.html`, alias `@/`.
- **Contrato de API verificado**: `src/services/apiClient.ts`,
  `apiSchemas.ts`, `eventsApi.ts`, `newsApi.ts` y `src/data/fixtures/*`.
  Están validados contra la API real; si necesitas un dato que no está
  en el contrato, dilo en el chat en lugar de cambiar los schemas.

## 5. Separación presentación / lógica (obligatoria)

- Las pantallas y componentes son **presentacionales**: reciben datos y
  callbacks. Prohibido `fetch`/clientes HTTP o de BD dentro de
  componentes; todo acceso a datos pasa por un service de `services/`.
- Services: funciones `async` tipadas cuya firma es el **contrato**. Los
  mock simulan latencia (300–800 ms) leyendo de `data/`; en producción
  se sustituye la implementación SIN tocar pantallas.
- Estado: local con `useState`; global con el store de Zustand
  (`stores/`); flujos complejos (chat, procesos multi-paso) con máquinas
  XState en `machines/`; datos remotos con @tanstack/react-query sobre
  los services. No introduzcas otra librería de estado.
- Estado de pantalla como unión discriminada explícita:
  `type ScreenState = 'loading' | 'empty' | 'error' | 'ready'`.
- **Toda pantalla implementa los 4 estados**: loading (Skeleton), empty
  (bloque con CTA), error (mensaje semántico + reintentar) y feliz. El
  Product Owner valida los cuatro.
- Formularios: react-hook-form + resolver de zod.

## 6. Consumo de APIs reales (solo lectura)

Está permitido consumir APIs públicas de solo lectura para diseñar con
datos reales (hoy: events-query, `eventquery.km0lab.com`). Reglas:

- SIEMPRE a través de un service (`eventsApi.ts`, `newsApi.ts`) que
  valida la respuesta con zod (`apiSchemas.ts`) — nunca `fetch` directo
  en componentes ni schemas duplicados.
- Base URL desde `VITE_EVENTS_API_URL`; nunca URLs hardcodeadas en
  componentes ni claves privadas en el código.
- Cada endpoint consumido tiene su **fixture** capturada en
  `data/fixtures/` para prototipar sin red y forzar los estados
  empty/error.
- Solo GET/consulta. Si una pantalla necesita escribir datos, la
  escritura se define como firma mock y se implementa en producción.

## 7. Requisitos para la sincronización automática

- Imports SIEMPRE con el alias `@/` (`@/components/ui/button`,
  `@/stores/useAppStore`, `@/lib/i18n`…). Prohibidos los relativos
  profundos (`../../`). El sync reescribe estos paths a los paquetes del
  monorepo; cualquier otro patrón rompe la reescritura.
- Importa primitivos ui **archivo a archivo**
  (`import { Button } from '@/components/ui/button'`), nunca con barrels
  ni `import *`.
- El código de producto no importa NADA de `src/integrations/` ni de las
  piezas solo-Lovable (§0); esa frontera es la que permite sincronizar.
- No uses APIs exclusivas del runtime de Lovable ni componentes
  `lovable-*` en el código de `src/`.
- No dejes código muerto, `console.log` ni TODOs sin contexto.

## 8. Dependencias, estilos, assets y traducciones

- **Dependencias**: NO añadas paquetes npm nuevos por tu cuenta. Lista
  aprobada: react, react-dom, react-router-dom, framer-motion,
  lucide-react, clsx, tailwind-merge, class-variance-authority, zod,
  react-hook-form, @hookform/resolvers, @tanstack/react-query, sonner,
  zustand, xstate, @xstate/react, date-fns, embla-carousel-react,
  canvas-confetti, tailwindcss-animate y los `@radix-ui/react-*` que
  necesiten los primitivos shadcn. Si una funcionalidad exige otra
  librería, dilo en el chat y espera aprobación humana antes de usarla.
- **Estilos**: solo clases Tailwind con tokens (ver §3). Nada de CSS
  nuevo fuera de `index.css`, y en `index.css` solo tokens/`@layer`.
- **Assets**: nuevos binarios en `src/assets/` con nombre `kebab-case`
  sin sufijos de versión (`km0-robot.png`, no `km0_robot_icon_v2.png`).
  Los SVG se importan como URL (`<img src={...}>`), no como componentes.
  Fuentes: no añadas familias nuevas; Inter (Google Fonts) y Antique
  Olive ya están definidas.
- **Traducciones**: todo el copy visible vive en el diccionario tipado
  `lib/i18n.ts` (claves `"pantalla.elemento"` con `{ ca, es, en }`) y se
  consume con `t()` + `useLang()`. Nunca strings hardcodeadas en JSX ni
  copy dentro de `components/ui/`. Los datos bilingües de API se adaptan
  en el service (patrón `Record<Lang, string>`, ver `newsApi.ts`).

## 9. Modo no técnico (Product Owner / diseño)

Cuando un prompt describa un cambio en lenguaje no técnico (sin rutas de
archivo ni clases CSS), actúa así:

1. Identifica tú el componente y archivo afectados, y dilo.
2. Antes de tocar código, reformula el cambio en UNA frase no técnica
   (p. ej. "Voy a centrar las flechas del carrusel respecto a la
   tarjeta, sin tocar el modo horizontal") y espera confirmación.
3. Toca exclusivamente el elemento señalado.
4. Aplica todas las reglas de este documento sin que te las pidan.
5. Si el cambio exige una decisión técnica (dependencia nueva, tocar un
   intocable, cambio estructural, conectar datos), NO lo hagas: explica
   en lenguaje llano qué hace falta y sugiere pasarlo al desarrollador.

Las capturas de pantalla con el elemento marcado valen como referencia
de "dónde". El modo Visual Edit es la vía preferente para cambios
visuales puntuales de quien no programa.

## 10. Checklist antes de dar una pantalla por terminada

- [ ] Se ve correcta en las 4 resoluciones canónicas.
- [ ] Implementa los 4 estados (loading / empty / error / feliz).
- [ ] Copy en `lib/i18n.ts`, sin strings en JSX.
- [ ] Datos vía service tipado (mock o API read-only con zod + fixture).
- [ ] Solo tokens del design system; cero hex, cero estilos estáticos
      inline.
- [ ] Imports con `@/`, primitivos ui archivo a archivo.
- [ ] Sin dependencias fuera de la lista aprobada.
- [ ] Sin imports de piezas solo-Lovable en código de producto.
