# Knowledge de Lovable — contrato de generación de código

> **Qué es esto**: el texto que hay que pegar en el proyecto de Lovable
> (`Settings → Knowledge`) para que TODO el código que genere sea
> sincronizable automáticamente con el monorepo de producción `km0lab`
> mediante `pnpm sync:lovable` (ver `docs/PORTING-FROM-LOVABLE.md` §12),
> sin retoques manuales ni conflictos.
>
> **Cómo instalarlo**:
>
> 1. Copia todo el contenido a partir del separador `=== KNOWLEDGE ===`.
> 2. Pégalo en `Settings → Knowledge` del proyecto de Lovable.
> 3. Añade a continuación el prompt pack del design system: ejecuta
>    `generateAIContext()` de `packages/app/design-system/aiContext.ts`
>    y pega su salida debajo (tokens, paleta, tipografía, breakpoints).
> 4. Cuando cambien estas reglas o los tokens, **actualiza la Knowledge
>    de Lovable en el mismo PR** que cambie este archivo.
>
> **Recuerda** (lección de `PORTING-FROM-LOVABLE.md` §9): la Knowledge es
> declarativa, no una garantía. El automatismo de sync verifica el código
> real; si Lovable incumple una regla, el sync lo reporta como error.

---

=== KNOWLEDGE ===

Eres el entorno de prototipado visual del proyecto **KM0 LAB**. El código
que generas NO es desechable: se sincroniza de forma automática con un
monorepo de producción mediante un mapping mecánico de archivos. Cada
regla de este documento existe para que esa sincronización funcione sin
intervención humana. Cúmplelas literalmente.

## 1. Estructura de carpetas (contrato de sync)

Trabaja SOLO dentro de `src/`, con esta estructura exacta:

```
src/
├── pages/          # 1 pantalla = 1 archivo PascalCase (Home.tsx)
├── components/     # componentes específicos de pantalla, PascalCase, planos
│   └── ui/         # primitivos shadcn, kebab-case (button.tsx, dialog.tsx)
├── hooks/          # hooks reutilizables (use-postal-code.ts)
├── services/       # capa de datos: servicios tipados con implementación mock
├── data/           # datos mock estáticos que consumen los services
├── locales/        # copy de producto: 1 JSON por pantalla
├── assets/         # imágenes y fuentes (kebab-case)
└── lib/utils.ts    # SOLO cn(). No añadas nada más aquí.
```

Cada carpeta tiene un destino fijo en producción; NO crees carpetas
nuevas de primer nivel ni subcarpetas en `pages/`. Los componentes de
`components/` van planos; solo agrupa en subcarpeta PascalCase cuando una
pantalla tenga varios componentes auxiliares propios
(`components/Onboarding/OnboardingSlide.tsx`).

## 2. Convenciones de nombres

- Código e identificadores **en inglés**. Copy de producto en el idioma
  del producto (ca/es/en), siempre en `locales/`.
- Pantallas y componentes de app: archivo y componente en `PascalCase`,
  `export default`.
- Primitivos de `components/ui/`: archivo `kebab-case`, **exports con
  nombre** (estilo shadcn: `export { Button, buttonVariants }`).
- Hooks: archivo `use-<nombre>.ts(x)` en kebab-case, función `useNombre`.
- Services y data: archivo `camelCase.ts` (`postalCodeService.ts`).
- Props y funciones: `camelCase`. Tipos exportados: `PascalCase`, sin
  prefijo `I`. Props siempre tipadas; **prohibido `any`**.
- Rutas de React Router: paths en `kebab-case` (`/postal-code`).
- Un componente por archivo; el nombre del archivo = nombre del export.

## 3. Design system y componentes compartidos

- Usa EXCLUSIVAMENTE los tokens del design system KM0 (documento anexo):
  tokens semánticos (`primary`, `foreground`, `muted`, `card`,
  `destructive`, `success`…) o paleta `km0-*`. **Prohibido** hex/rgb
  crudos, `style={{...}}` inline y atributos de presentación.
- Antes de crear un primitivo nuevo en `components/ui/`, reutiliza los
  existentes (button, card, input, badge, alert, progress, skeleton,
  separator, label, text, textarea). Composición explícita (`<Card>`,
  `<CardHeader>`…) antes que props mágicas.
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
(solo primitivos NUEVOS), `hooks/`, `services/`, `data/`, `locales/`,
`assets/`.

**Intocables** (son espejo de producción; cambiarlos rompe el sync):

- `src/lib/utils.ts`
- `tailwind.config.ts` y las variables CSS existentes de `index.css`
  (añadir un token nuevo está permitido; renombrar o borrar, no).
- Primitivos existentes de `components/ui/`: no cambies su API (props,
  exports). Extiende añadiendo variantes CVA nuevas sin romper las
  existentes.
- `vite.config.ts`, `index.html`, alias `@/`.

## 5. Separación presentación / lógica (obligatoria)

- Las pantallas y componentes son **presentacionales**: reciben datos y
  callbacks, no hacen fetch. Prohibido `fetch`/`axios`/clientes HTTP o de
  BD dentro de componentes.
- Todo acceso a datos pasa por un **service** en `services/`, con esta
  forma:
  - Schemas y tipos con **zod** exportados desde el service.
  - Funciones `async` que devuelven `Promise<T>` y simulan latencia
    (300–800 ms) leyendo mocks de `data/`.
  - La firma de las funciones es el **contrato**: en producción se
    sustituye la implementación mock por la API real SIN tocar pantallas.
- Estado de pantalla como unión discriminada explícita:
  `type ScreenState = 'loading' | 'empty' | 'error' | 'ready'`.
- **Toda pantalla implementa los 4 estados**: loading (Skeleton), empty
  (bloque con CTA), error (mensaje semántico + reintentar) y feliz. El
  Product Owner valida los cuatro.
- Formularios: react-hook-form + resolver de zod (schema del service).
- Estado servidor con @tanstack/react-query (`useQuery`/`useMutation`
  sobre los services); estado local con `useState`. No introduzcas otra
  librería de estado.
- Si usas integraciones nativas de Lovable (p. ej. Supabase), su cliente
  vive SOLO dentro de un service, detrás de la misma interfaz tipada;
  nunca en componentes. Producción reimplementará ese service.

## 6. Requisitos para la sincronización automática

- Imports SIEMPRE con el alias `@/` (`@/components/ui/button`,
  `@/hooks/use-x`, `@/services/x`, `@/data/x`, `@/assets/...`). Prohibidos
  los relativos profundos (`../../`). El sync reescribe estos paths a los
  paquetes del monorepo; cualquier otro patrón rompe la reescritura.
- Importa primitivos ui **archivo a archivo**
  (`import { Button } from '@/components/ui/button'`), nunca con barrels
  ni `import *`.
- No uses APIs exclusivas del runtime de Lovable ni componentes
  `lovable-*` en el código de `src/`.
- No dejes código muerto, `console.log` ni TODOs sin contexto.
- No hardcodees copy en componentes: ver §7 (locales).

## 7. Dependencias, estilos, assets y traducciones

- **Dependencias**: NO añadas paquetes npm nuevos por tu cuenta. Lista
  aprobada: react, react-dom, react-router-dom, framer-motion,
  lucide-react, clsx, tailwind-merge, class-variance-authority, zod,
  react-hook-form, @hookform/resolvers, @tanstack/react-query, sonner y
  los `@radix-ui/react-*` que necesiten los primitivos shadcn. Si una
  funcionalidad exige otra librería, dilo en el chat y espera aprobación
  humana antes de usarla.
- **Estilos**: solo clases Tailwind con tokens (ver §3). Nada de CSS
  nuevo fuera de `index.css`, y en `index.css` solo tokens/`@layer`.
- **Assets**: nuevos binarios en `src/assets/` con nombre `kebab-case`
  sin sufijos de versión (`km0-robot.png`, no `km0_robot_icon_v2.png`).
  Los SVG se importan como URL (`<img src={...}>`), no como componentes.
  Fuentes: no añadas familias nuevas; Inter (Google Fonts) y Antique
  Olive ya están definidas.
- **Traducciones**: todo el copy visible vive en
  `locales/<pantalla>.json` con la forma
  `{ "clave": { "ca": "…", "es": "…", "en": "…" } }`. Las pantallas leen
  ese JSON; nunca strings hardcodeadas en JSX ni copy dentro de
  `components/ui/`.

## 8. Checklist antes de dar una pantalla por terminada

- [ ] Se ve correcta en las 4 resoluciones canónicas.
- [ ] Implementa los 4 estados (loading / empty / error / feliz).
- [ ] Copy en `locales/<pantalla>.json`, sin strings en JSX.
- [ ] Datos vía service tipado con zod + mock en `data/`.
- [ ] Solo tokens del design system; cero hex, cero estilos inline.
- [ ] Imports con `@/`, primitivos ui archivo a archivo.
- [ ] Sin dependencias fuera de la lista aprobada.
