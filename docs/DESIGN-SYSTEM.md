<!-- GENERADO por scripts/generate-design-doc.mjs — NO editar a mano.
     Regenerar con: pnpm design:doc -->

# KM0 LAB — Design System Context for AI Prototyping

> Pega este documento como _system prompt_ al iniciar una conversación con la IA que generará prototipos. Incluye TODAS las restricciones del sistema KM0 LAB. La IA debe respetarlas literalmente.

## 1. Stack y convenciones

- React 18 + TypeScript + Vite
- Tailwind CSS v3 + shadcn/ui (Radix)
- Framer Motion para animaciones
- lucide-react para iconografía
- React Router v6

**Reglas obligatorias:**

- NUNCA usar colores hex/rgb crudos en componentes. Solo tokens semánticos o paleta `km0-*`.
- NUNCA modificar los breakpoints (están alineados con Playwright en producción).
- Mobile-first: el layout base es portrait; landscape es variante explícita.
- Pantallas con marca (entrada, login, configuración) DEBEN envolverse en `<BrandedFrame>`. Chat usa fullbleed propio.

## 2. Tokens semánticos (preferir siempre estos)

| Token                    | Mapea a         | Uso                                                    |
| ------------------------ | --------------- | ------------------------------------------------------ |
| `background`             | km0-beige-50    | Fondo global de la app.                                |
| `foreground`             | km0-blue-800    | Color de texto por defecto sobre background.           |
| `card`                   | white           | Superficie de tarjetas (inputs, popovers).             |
| `primary`                | km0-blue-700    | CTA principal, foco, énfasis máximo.                   |
| `primary-foreground`     | white           | Texto sobre primary.                                   |
| `secondary`              | km0-beige-100   | Superficies cálidas secundarias.                       |
| `muted`                  | km0-beige-50    | Fondos sutiles, separadores blandos.                   |
| `muted-foreground`       | hsl(220 9% 46%) | Texto secundario / placeholder visible.                |
| `accent`                 | km0-teal-500    | Acento interactivo (iconos, hovers de elementos teal). |
| `destructive`            | km0-coral-400   | Errores, validación negativa, acciones destructivas.   |
| `destructive-foreground` | white           | Texto sobre destructive.                               |
| `border`                 | km0-beige-200   | Bordes neutros por defecto.                            |
| `input`                  | km0-beige-200   | Borde de campos de formulario.                         |
| `ring`                   | km0-blue-700    | Anillo de focus accesible.                             |
| `radius`                 | 0.75rem         | Radio base; rounded-2xl/3xl son los más usados.        |

## 3. Paleta KM0 cruda (cuando un semántico no encaja)

### km0-blue — _principal: 700_

Color institucional. Identidad principal de marca, headers y CTAs primarios.

| Shade | HSL           | Hex       | Uso                                                    |
| ----- | ------------- | --------- | ------------------------------------------------------ |
| 50    | `214 69% 97%` | `#F0F4FD` | fondos sutiles, hover de superficies claras            |
| 100   | `228 60% 91%` | `#DADEF8` |                                                        |
| 200   | `222 64% 82%` | `#B5C3F0` |                                                        |
| 300   | `218 60% 73%` | `#90A9E8` |                                                        |
| 400   | `214 49% 62%` | `#6B8FD0` |                                                        |
| 500   | `215 43% 49%` | `#4674B8` |                                                        |
| 600   | `217 56% 40%` | `#2B5AA0` | hover del CTA primario                                 |
| 700   | `220 73% 33%` | `#174094` | PRINCIPAL — primary, ring, bordes de marca, títulos H1 |
| 800   | `214 61% 19%` | `#132A50` | foreground principal sobre beige                       |
| 900   | `214 63% 15%` | `#0F2040` | background dark mode                                   |

### km0-beige — _principal: 100_

Fondos cálidos del producto. Secondary y superficies de la card.

| Shade | HSL           | Hex       | Uso                                         |
| ----- | ------------- | --------- | ------------------------------------------- |
| 50    | `36 100% 97%` | `#FFF9F0` | background global / muted                   |
| 100   | `33 100% 90%` | `#FFECD2` | PRINCIPAL — secondary, gradiente de la card |
| 200   | `51 96% 83%`  | `#FDEEA9` | border / input border por defecto           |
| 300   | `47 93% 73%`  | `#FBDB7E` |                                             |
| 400   | `44 90% 64%`  | `#F9C853` |                                             |
| 500   | `41 92% 56%`  | `#F7B528` |                                             |
| 600   | `39 73% 49%`  | `#DCA223` |                                             |
| 700   | `38 72% 43%`  | `#C18F1E` |                                             |
| 800   | `37 72% 37%`  | `#A67C19` |                                             |
| 900   | `36 72% 31%`  | `#8B6914` |                                             |

### km0-yellow — _principal: 500_

Color de atención y back navigation. Usado en bordes punteados y elementos secundarios destacados.

| Shade | HSL           | Hex       | Uso                           |
| ----- | ------------- | --------- | ----------------------------- |
| 50    | `44 100% 97%` | `#FEFAF0` | hover del back button         |
| 100   | `45 95% 93%`  | `#FDF5DA` |                               |
| 200   | `44 91% 84%`  | `#FBE9B4` |                               |
| 300   | `44 91% 76%`  | `#F9DD8E` |                               |
| 400   | `43 91% 69%`  | `#F7D168` |                               |
| 500   | `43 89% 61%`  | `#F5C542` | PRINCIPAL — borde back button |
| 600   | `39 73% 49%`  | `#DCA223` | icono back button             |
| 700   | `38 72% 43%`  | `#C18F1E` |                               |
| 800   | `37 72% 37%`  | `#A67C19` |                               |
| 900   | `36 72% 31%`  | `#8B6914` |                               |

### km0-teal — _principal: 500_

Acento interactivo. Iconos activos, focus de inputs, confirmaciones positivas.

| Shade | HSL            | Hex       | Uso                                        |
| ----- | -------------- | --------- | ------------------------------------------ |
| 50    | `178 100% 97%` | `#F0FFFE` |                                            |
| 100   | `178 100% 90%` | `#CCFAF8` |                                            |
| 200   | `177 80% 73%`  | `#80EAE4` |                                            |
| 300   | `177 72% 57%`  | `#40D9D0` |                                            |
| 400   | `177 100% 42%` | `#00C7BC` | focus border de inputs                     |
| 500   | `177 100% 36%` | `#00B8A9` | PRINCIPAL — accent, iconos activos         |
| 600   | `177 100% 30%` | `#009A8E` | texto confirmación (ej: ciudad encontrada) |
| 700   | `177 100% 24%` | `#007C72` |                                            |
| 800   | `177 100% 18%` | `#005E56` |                                            |
| 900   | `177 100% 13%` | `#00403B` |                                            |

### km0-coral — _principal: 400_

Color de error y alerta. Destructive token. Usar SOLO para validación negativa o destrucciones.

| Shade | HSL           | Hex       | Uso                                              |
| ----- | ------------- | --------- | ------------------------------------------------ |
| 50    | `5 100% 93%`  | `#FFE0DB` |                                                  |
| 100   | `5 100% 86%`  | `#FFC2B7` |                                                  |
| 200   | `5 100% 79%`  | `#FFA394` |                                                  |
| 300   | `5 100% 72%`  | `#FF8570` |                                                  |
| 400   | `7 100% 65%`  | `#FF664D` | PRINCIPAL — destructive (errores, no encontrado) |
| 500   | `13 100% 48%` | `#F73200` | destructive en dark mode                         |
| 600   | `13 100% 43%` | `#DC2C00` |                                                  |
| 700   | `13 100% 38%` | `#C12600` |                                                  |
| 800   | `13 100% 32%` | `#A62000` |                                                  |
| 900   | `13 100% 27%` | `#8B1A00` |                                                  |

## 4. Tipografía

Tres familias semánticas. **El peso está implícito en la familia** — NO añadir `font-bold`/`font-semibold` sobre `font-brand` (ya es Black 900).

| Clase        | Familia                  | Peso | Uso                                                                     |
| ------------ | ------------------------ | ---- | ----------------------------------------------------------------------- |
| `font-brand` | Antique Olive            | 900  | Títulos H1 de pantalla, branding (logo). NUNCA añadir font-bold encima. |
| `font-ui`    | Inter                    | 400  | Texto de UI: labels, botones, inputs. Permite font-semibold/medium.     |
| `font-body`  | DM Sans (fallback Inter) | 400  | Párrafos, subtítulos descriptivos, copy largo.                          |

### Escala de tamaños usada en el proyecto

| Clase       | px  | line-height | Uso                               |
| ----------- | --- | ----------- | --------------------------------- |
| `text-xs`   | 12  | 16          | captions, errores en landscape    |
| `text-sm`   | 14  | 20          | subtítulos, copy de soporte, CTAs |
| `text-base` | 16  | 24          | body por defecto                  |
| `text-lg`   | 18  | 28          | input grande                      |
| `text-xl`   | 20  | 28          | H1 confirmación (ciudad)          |
| `text-2xl`  | 24  | 32          | H1 principal en portrait          |
| `text-3xl`  | 30  | 36          | H1 grande en horizontal-desktop   |

## 5. Spacing

| Token Tailwind    | px  | Uso típico                              |
| ----------------- | --- | --------------------------------------- |
| `gap-1` / `p-1`   | 4   |                                         |
| `gap-2` / `p-2`   | 8   |                                         |
| `gap-3` / `p-3`   | 12  |                                         |
| `gap-4` / `p-4`   | 16  |                                         |
| `gap-5` / `p-5`   | 20  |                                         |
| `gap-6` / `p-6`   | 24  | gap principal entre bloques en portrait |
| `gap-7` / `p-7`   | 28  | gap en vertical-mobile (más aire)       |
| `gap-8` / `p-8`   | 32  |                                         |
| `gap-12` / `p-12` | 48  |                                         |

## 6. Border Radius

| Clase         | px  | Uso                                         |
| ------------- | --- | ------------------------------------------- |
| `rounded-md`  | 6   | elementos pequeños internos                 |
| `rounded-lg`  | 8   |                                             |
| `rounded-xl`  | 12  | back button                                 |
| `rounded-2xl` | 16  | PRINCIPAL — inputs, botones, cards internas |
| `rounded-3xl` | 24  | BrandedFrame outer card, imágenes hero      |

## 7. Breakpoints (CRÍTICO)

Solo existen estos cuatro. Están sincronizados con Playwright. Cualquier diseño responsive DEBE expresarse con estas variantes:

| Variante Tailwind     | Media query                                               | Resolución de test |
| --------------------- | --------------------------------------------------------- | ------------------ |
| `vertical-mobile:`    | `@media (orientation: portrait) and (max-width: 767px)`   | 375×667            |
| `vertical-tablet:`    | `@media (orientation: portrait) and (min-width: 768px)`   | 768×1024           |
| `horizontal-mobile:`  | `@media (orientation: landscape) and (max-width: 1279px)` | 667×375            |
| `horizontal-desktop:` | `@media (orientation: landscape) and (min-width: 1280px)` | 1280×550           |

Aliases DEPRECADOS (no usar): `short-landscape`, `wide-landscape`, `tablet-portrait`.

## 8. Animaciones

| Nombre        | Cómo aplicar         | Duración | Uso                                                |
| ------------- | -------------------- | -------- | -------------------------------------------------- |
| fadeInUp      | `animate-fade-in-up` | 0.4s     | entrada de elementos al montar                     |
| float         | `animate-float`      | 3s       | mascota / elementos ambientales                    |
| framer fade+y | `(framer-motion)`    | 0.4s     | stagger 0.15s entre bloques en pantallas con marca |

**Patrón estándar de entrada de pantalla** (Framer Motion):

```tsx
<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.25 }}>
```

Usar `delay` escalonado de 0.15s, 0.25s, 0.3s, 0.35s entre bloques verticales.

## 9. Iconografía

- Librería: **lucide-react**
- Tamaño por defecto: 22px
- Tamaños semánticos: sm=14, md=18, lg=22, xl=24
- Pares semánticos (estado positivo / negativo):
  - `MapPin` ↔ `MapPinOff` — ubicación válida vs no reconocida
  - `Check` ↔ `AlertTriangle` — validación de formulario
  - `Mic` ↔ `MicOff` — grabación de voz

## 10. Componentes base — JSX listo para usar

### Botón primario

```tsx
<button className="w-full bg-primary text-primary-foreground font-ui font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
  CONTINUAR
</button>
```

### Input con estados (idle / error)

```tsx
<div
  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition-colors ${
    hasError
      ? 'bg-destructive/5 border-destructive/50 focus-within:border-destructive'
      : 'bg-white border-km0-beige-200 focus-within:border-km0-teal-400'
  }`}
>
  {hasError ? (
    <MapPinOff className="text-destructive" size={22} />
  ) : (
    <MapPin className="text-km0-teal-500" size={22} />
  )}
  <input className="flex-1 bg-transparent font-ui text-lg outline-none placeholder:text-muted-foreground/50" />
</div>
```

### BrandedFrame (wrapper obligatorio para pantallas de marca)

```tsx
<BrandedFrame onBack={() => navigate(-1)} backAriaLabel="Back">
  {/* Contenido de la pantalla. Renderiza vistas separadas para portrait / landscape: */}
  <div className="landscape:hidden flex flex-col gap-6 vertical-mobile:gap-7">
    …
  </div>
  <div className="hidden landscape:flex gap-4 horizontal-desktop:gap-8">…</div>
</BrandedFrame>
```

## 11. Anti-patrones (NO hacer)

- ❌ `text-white`, `bg-black`, `text-[#174094]` → usar tokens.
- ❌ `font-brand font-bold` → `font-brand` ya es weight 900.
- ❌ `md:`, `lg:`, `xl:`, `sm:` (breakpoints Tailwind por defecto) → usar `vertical-mobile:`, `vertical-tablet:`, `horizontal-mobile:`, `horizontal-desktop:`.
- ❌ `h-screen` en pantallas con scroll → usar `min-h-[100dvh]` o el layout fixed del Chat (`fixed inset-0 overflow-hidden`).
- ❌ Logo y back button posicionados manualmente → siempre vía `<BrandedFrame>`.
- ❌ Hex/rgb crudos en `style={{}}` → solo tokens HSL via `hsl(var(--token))`.

## 12. Resoluciones de validación (Playwright)

Cualquier prototipo DEBE funcionar sin scroll vertical en estas 4 resoluciones (excepto Chat):

- 375 × 667 (vertical-mobile)
- 768 × 1024 (vertical-tablet)
- 667 × 375 (horizontal-mobile) ← más restrictiva en altura
- 1280 × 550 (horizontal-desktop) ← también restrictiva en altura

---

# KM0 LAB — Catálogo de componentes

> Componentes propios del proyecto (no shadcn/ui). Importar tal cual desde las rutas indicadas. NO recrearlos.

## Marca y layout

### BrandedFrame

- **Import:** `import BrandedFrame from "@/components/BrandedFrame"`
- **Usado en:** Language (Index), Onboarding, PostalCode
- Wrapper obligatorio para pantallas con marca. Garantiza logo + back en posición idéntica y card de tamaño fijo (ratio móvil en portrait, 16:9 en landscape) en los 4 breakpoints.

**Props:**

- `children`: `ReactNode` _(required)_ — Contenido renderizado dentro de la card.
- `onBack`: `() => void` — Si se pasa, muestra el botón back amarillo a la izquierda del logo.
- `backAriaLabel`: `string` — default `"Back"` — Aria label del botón back (i18n responsabilidad del consumidor).
- `hideHeader`: `boolean` — default `false` — Oculta el header con logo (cuando la pantalla ya tiene su propio hero).
- `portraitContentClassName`: `string` — Clases extra para el body en portrait.
- `landscapeContentClassName`: `string` — Clases extra para el body en landscape.

**Responsive:**

- `vertical-mobile`: Card ratio 9:19.5, logo h-9, header pt-5/pb-4.
- `vertical-tablet`: Misma card pero clampada a 420px de ancho.
- `horizontal-mobile`: Card ratio 16:9 compacta, logo h-8, paddings reducidos.
- `horizontal-desktop`: Card ratio 16:9 hasta 1200px, logo h-11, padding cómodo.

**Notas:**

- El tamaño de la card se calcula SOLO desde el viewport, nunca del contenido — el frame nunca se deforma.
- Si el contenido no cabe, hace scroll-y INTERNO en el body. Nunca scroll horizontal.
- Chat NO usa este wrapper: tiene layout fullbleed propio.

### Km0Logo

- **Import:** `import Km0Logo from "@/components/Km0Logo"`
- **Usado en:** BrandedFrame, Chat header
- Logo institucional KM0 LAB en SVG. Color y proporciones fijas, solo se controla el tamaño desde className.

**Props:**

- `className`: `string` — default `""` — Clases de Tailwind para tamaño. Habitualmente "h-8" a "h-11".

**Responsive:**

- `vertical-mobile`: h-9 dentro del frame.
- `vertical-tablet`: h-9 dentro del frame (clampado por viewBox).
- `horizontal-mobile`: h-8 compacto.
- `horizontal-desktop`: h-11.

**Notas:**

- No añadir font-bold ni alterar fill — colores ya forman parte del SVG.

### FloatingDots

- **Import:** `import FloatingDots from "@/components/FloatingDots"`
- **Usado en:** PostalCode, Onboarding fondos
- Puntos teal animados (animate-float) posicionados absolutos sobre un contenedor `relative`. Decoración ambiental.

**Props:**

- `className`: `string` — Clases extra para el contenedor absoluto.

**Responsive:**

- `vertical-mobile`: Posiciones idénticas (porcentaje del contenedor).
- `vertical-tablet`: Igual — escala con el padre.
- `horizontal-mobile`: Igual — escala con el padre.
- `horizontal-desktop`: Igual — escala con el padre.

**Notas:**

- El padre DEBE ser `relative` y normalmente `overflow-hidden`.

## Navegación

### BottomTabs

- **Import:** `import BottomTabs from "@/components/BottomTabs"`
- **Usado en:** Home, Agenda
- Barra de navegación inferior fija con 4 tabs (Inicio · Información · Ofertas · Perfil). El tab Perfil cambia de acción según haya sesión.

**Props:**

- `activeTab`: `"home" | "info" | "ofertes" | "perfil"` _(required)_ — Tab activo (controlado por la pantalla).
- `onTabChange`: `(t: HomeTab) => void` _(required)_ — Callback al cambiar de tab.
- `showProfile`: `boolean` _(required)_ — Si hay sesión, el tab Perfil navega a /profile; si no, a /login.
- `onLogin`: `() => void` _(required)_ — Acción cuando no hay sesión y se pulsa Perfil.
- `onProfile`: `() => void` _(required)_ — Acción cuando hay sesión y se pulsa Perfil.

**Responsive:**

- `vertical-mobile`: pt-2/pb-3, iconos 20px, labels 10px.
- `vertical-tablet`: Igual que vertical-mobile (no escala).
- `horizontal-mobile`: Paddings reducidos: pt-1/pb-1.5 (override !important).
- `horizontal-desktop`: Como vertical-mobile.

### NavLink

- **Import:** `import NavLink from "@/components/NavLink"`
- **Usado en:** (libre — disponible para cualquier nav)
- Wrapper de `react-router-dom NavLink` que acepta className + activeClassName + pendingClassName como strings simples, sin function-as-children.

**Props:**

- `to`: `string` _(required)_ — Destino (igual que NavLink de react-router).
- `className`: `string` — Clases base aplicadas siempre.
- `activeClassName`: `string` — Clases añadidas cuando la ruta está activa.
- `pendingClassName`: `string` — Clases añadidas cuando la ruta está en pending.

**Responsive:**

- `vertical-mobile`: Las clases que pases definen el comportamiento.
- `vertical-tablet`: Idem.
- `horizontal-mobile`: Idem.
- `horizontal-desktop`: Idem.

### LoginButton

- **Import:** `import LoginButton from "@/components/LoginButton"`
- **Usado en:** HomeHero, Agenda
- Botón “Iniciar sesión” reutilizable, amarillo sobre texto azul. Sin wrapper ni animaciones externas — el consumidor decide layout.

**Props:**

- `onClick`: `() => void` _(required)_ — Acción al pulsar.
- `size`: `"sm" | "md"` — default `"sm"` — Tamaño visual. sm escala con vertical-tablet.
- `className`: `string` — Overrides puntuales (por ejemplo por breakpoint).
- `label`: `string` — default `"Iniciar sesión"` — Texto del botón (i18n del consumidor).

**Responsive:**

- `vertical-mobile`: sm: text-xs · px-3.5 · py-1.
- `vertical-tablet`: sm: text-sm · px-5 · py-1.5 (escalado).
- `horizontal-mobile`: sm: text-xs (no escala).
- `horizontal-desktop`: sm: text-xs (no escala).

## Cabeceras

### HomeHero

- **Import:** `import HomeHero from "@/components/HomeHero"`
- **Usado en:** Home (vía HomeContent), Agenda, Chat
- Header superior compartido por Home y pantallas interiores (Agenda, Chat). Skyline + escudo + nombre de ciudad + logo KM0 + (opcional) back + login + campana. Slot inferior con UserGreeting o contenido custom.

**Props:**

- `cityName`: `string` _(required)_ — Nombre de la ciudad/municipio.
- `hasAlerts`: `boolean` _(required)_ — Si true, la campana muestra dot coral.
- `onToggleAlerts`: `() => void` _(required)_ — Abre/cierra el overlay de notificaciones.
- `showLogin`: `boolean` _(required)_ — Si true, muestra el LoginButton.
- `onLogin`: `() => void` _(required)_ — Acción del login.
- `onBack`: `() => void` — Si se pasa, muestra el botón Back amarillo a la izquierda del escudo (pantallas interiores).
- `backAriaLabel`: `string` — default `"Volver"` — Aria label del back.
- `showGreeting`: `boolean` — default `true` — Oculta el UserGreeting cuando se pone false.
- `greetingSlot`: `ReactNode` — Sustituye al UserGreeting (p.ej. ScreenTitle en Agenda/Chat) manteniendo la misma altura.

**Responsive:**

- `vertical-mobile`: pt-2/pb-1, escudo 12×12, logo h-4, h1 text-lg.
- `vertical-tablet`: Escudo 14×14, logo h-5, padding cómodo.
- `horizontal-mobile`: Se vuelve absolute inset-0 (fondo del body). Escudo 7×7, logo h-3, h1 text-sm en línea.
- `horizontal-desktop`: absolute inset-0 con contenido más amplio.

**Notas:**

- En landscape el Hero es FONDO del body — el contenido del Home queda por encima vía z-10.
- Si pasas greetingSlot, NO pongas showGreeting=false: el wrapper de fondo se preserva por la condición `greetingSlot || showGreeting`.

### UserGreeting

- **Import:** `import UserGreeting from "@/components/UserGreeting"`
- **Usado en:** HomeHero (slot por defecto)
- Saludo con avatar, nombre, puntos y barra de progreso al siguiente nivel. Se renderiza dentro del slot inferior de HomeHero cuando hay sesión.

**Props:**

- `name`: `string | null` — Nombre a saludar; si vacío, solo 'Hola'.
- `points`: `number` _(required)_ — Puntos actuales del usuario.
- `nextLevel`: `number` _(required)_ — Umbral del siguiente nivel (para la barra).
- `className`: `string` — Clases extra (override de layout).

**Responsive:**

- `vertical-mobile`: Avatar 10×10, texto sm, tarjeta puntos 125px mín.
- `vertical-tablet`: Avatar 12×12, texto base, padding más cómodo.
- `horizontal-mobile`: Avatar 9×9, texto xs/[11px], tarjeta px-2.
- `horizontal-desktop`: Como vertical-mobile (no se escala más).

**Notas:**

- Maquetación pura: NO consume useAuth. El consumidor pasa los datos.
- Hoy hardcodeado a 'Albert / 1259 / 3000' en HomeHero — pendiente de conectar a sesión real.

### ScreenTitle

- **Import:** `import ScreenTitle from "@/components/ScreenTitle"`
- **Usado en:** Agenda (vía HomeHero.greetingSlot), Chat (vía HomeHero.greetingSlot)
- Sustituto del UserGreeting para pantallas interiores (Agenda, Chat). Mantiene la MISMA altura visual que UserGreeting para que el Hero no cambie de tamaño. Muestra icono + título + día de la semana + fecha destacada (Hoy DD mes).

**Props:**

- `title`: `string` _(required)_ — Título de la pantalla (p.ej. 'Agenda').
- `date`: `Date` — default `new Date()` — Fecha a mostrar; por defecto, hoy.
- `className`: `string` — Clases extra del contenedor.

**Responsive:**

- `vertical-mobile`: Icono 5×5 en burbuja 10×10, título text-sm, fecha text-2xl.
- `vertical-tablet`: Burbuja 12×12, título text-base, fecha text-4xl.
- `horizontal-mobile`: Burbuja 9×9, título text-xs, fecha compacta.
- `horizontal-desktop`: Como vertical-tablet.

**Notas:**

- NO incluye botón back — el back vive en HomeHero (prop onBack). ScreenTitle es solo el contenido del slot.
- Se inyecta vía HomeHero.greetingSlot, NO se monta suelto en ninguna pantalla.

### NotificationBell

- **Import:** `import NotificationBell from "@/components/NotificationBell"`
- **Usado en:** HomeHero
- Campana con dot de estado (coral si hay no leídas, beige si no). Se comporta como botón si recibe onClick; si no, como icono decorativo.

**Props:**

- `hasAlerts`: `boolean` — default `false` — Pinta el dot coral cuando hay notificaciones no leídas.
- `onClick`: `() => void` — Si se pasa, el componente se renderiza como <button>.
- `ariaLabel`: `string` — default `"Notifications"` — Aria label (i18n del consumidor).
- `className`: `string` — Clases extra.

**Responsive:**

- `vertical-mobile`: Botón 10×10, icono 24px (no escala).
- `vertical-tablet`: Igual.
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual.

## Home

### HomeContent

- **Import:** `import HomeContent from "@/components/HomeContent"`
- **Usado en:** Home
- Orquestador interno del Home reutilizado por los frames portrait y landscape de la página Home. Compone HomeHero + HomeModules + PromoSection + ComerciosSection + BottomTabs. NO conoce auth, router ni hooks: todo entra por props.

**Props:**

- `cityName`: `string` _(required)_ — Ciudad mostrada en el HomeHero.
- `hasAlerts`: `boolean` _(required)_ — Pasa al HomeHero/NotificationBell.
- `onToggleAlerts`: `() => void` _(required)_ — Abre overlay de notificaciones.
- `modules`: `HomeModule[]` _(required)_ — Módulos a renderizar en el grid (3 ideal).
- `promos`: `Promo[]` _(required)_ — Promos del PromoCarousel.
- `comercios`: `Comercio[]` _(required)_ — Comercios del ComercioCarousel.
- `activeTab`: `HomeTab` _(required)_ — Tab activo del BottomTabs.
- `onTabChange`: `(t: HomeTab) => void` _(required)_ — Callback al cambiar tab.
- `showLogin`: `boolean` _(required)_ — Si true, hay botón login (CTA central portrait + en hero landscape).
- `onLogin`: `() => void` _(required)_ — Acción login.
- `showProfile`: `boolean` _(required)_ — Si true, el tab Perfil va a /profile (no a /login).
- `onProfile`: `() => void` _(required)_ — Acción tab Perfil con sesión.
- `onSeeAllComercios`: `() => void` — Acción del link 'Ver todos' en ComerciosSection.

**Responsive:**

- `vertical-mobile`: Columna única: hero / módulos / promos / comercios apilados con justify-evenly.
- `vertical-tablet`: Igual que vertical-mobile (la página clampa el ancho).
- `horizontal-mobile`: Hero como fondo absoluto, body en grid 2-col compacto (promos | comercios).
- `horizontal-desktop`: Hero como fondo, body en grid 2-col cómodo.

**Notas:**

- Solo lo monta `src/pages/Home.tsx` (dentro de los wrappers portrait/landscape).
- Los borders negros visibles son DEBUG temporal — no quitar sin consultar.

### HomeModules

- **Import:** `import HomeModules from "@/components/HomeModules"`
- **Usado en:** Home (vía HomeContent)
- Grid de accesos rápidos estilo Glovo recoloreado a marca KM0: banda azul con curva orgánica + círculos blancos con icono coloreado + pill de label flotando bajo el círculo. Cada módulo es togglable (active/inactive).

**Props:**

- `modules`: `HomeModule[]` _(required)_ — Lista de módulos. Ids soportados: chat · agenda · ajuntament · punts · cupons · comerc.
- `className`: `string` — Clases extra del wrapper.

**Notas:**

- Color del icono por módulo está hardcodeado en ICON_COLOR (azul/teal/yellow/coral). Cambiarlo allí, no por props.
- El módulo 'central' tenía emphasized, hoy desactivado (todos al mismo tamaño).

### PromoSection

- **Import:** `import PromoSection from "@/components/PromoSection"`
- **Usado en:** Home (vía HomeContent)
- Wrapper visual de la sección 'Promos y eventos destacados': título + PromoCarousel.

**Props:**

- `promos`: `Promo[]` _(required)_ — Promos a mostrar en el carrusel.
- `title`: `string` — default `"Promos y eventos destacados"` — Título de la sección.
- `animationDelay`: `number` — default `0.26` — Delay del fade-in (segundos).

**Responsive:**

- `vertical-mobile`: Título text-sm, separación mb compacta.
- `vertical-tablet`: Título text-base.
- `horizontal-mobile`: Título text-xs, altura header 6, flex-col para que el carrusel ocupe lo que sobra.
- `horizontal-desktop`: Título text-lg.

### PromoCarousel

- **Import:** `import PromoCarousel from "@/components/PromoCarousel"`
- **Usado en:** PromoSection
- Carrusel de promos/eventos con drag horizontal (framer-motion), flechas condicionales (no first/no last) y dots clicables.

**Props:**

- `promos`: `Promo[]` _(required)_ — Lista de promos. Cada una define gradient + 3 títulos con color.

**Responsive:**

- `vertical-mobile`: Aspect-[2/1].
- `vertical-tablet`: Aspect-[16/9].
- `horizontal-mobile`: Aspect libre, ocupa flex-1 del padre.
- `horizontal-desktop`: Aspect libre, ocupa flex-1 del padre.

**Notas:**

- Componente 'tonto': no llama a API ni router; toda la data viene de @/data/promos.

### ComerciosSection

- **Import:** `import ComerciosSection from "@/components/ComerciosSection"`
- **Usado en:** Home (vía HomeContent)
- Wrapper visual de la sección 'Esto es para ti': icono cupón + título + link 'Ver todos' + ComercioCarousel.

**Props:**

- `comercios`: `Comercio[]` _(required)_ — Comercios del carrusel.
- `title`: `string` — default `"Esto es para ti"` — Título de la sección.
- `onSeeAll`: `() => void` — Acción del link 'Ver todos'.
- `animationDelay`: `number` — default `0.34` — Delay del fade-in (segundos).

**Responsive:**

- `vertical-mobile`: Icono cupón 12×12 a la izquierda del título, link text-xs.
- `vertical-tablet`: Título y link text-base.
- `horizontal-mobile`: Icono cupón oculto, link text-xs, fondo white/30 rounded-xl en torno al carrusel.
- `horizontal-desktop`: Como vertical-tablet con fondo white/30 alrededor del carrusel.

### ComercioCarousel

- **Import:** `import ComercioCarousel from "@/components/ComercioCarousel"`
- **Usado en:** ComerciosSection
- Carrusel paginado de logos de comercios. Cada página es una grid de 4 columnas con drag horizontal y dots clicables. Rellena huecos vacíos para mantener alineación.

**Props:**

- `comercios`: `Comercio[]` _(required)_ — Lista completa; el componente se encarga de paginar.
- `perPage`: `number` — default `4` — Comerciantes por página.

**Responsive:**

- `vertical-mobile`: Logos clamp(36-56px), label text-[10px].
- `vertical-tablet`: Logos 56×56, padding más cómodo.
- `horizontal-mobile`: Logos 36×36, layout flex-col para que el carrusel ocupe el alto del padre.
- `horizontal-desktop`: Como vertical-mobile con más aire vertical.

## Agenda y evento

### WhenTabs

- **Import:** `import WhenTabs from "@/components/WhenTabs"`
- **Usado en:** Agenda
- Segmented control de rango temporal para la Agenda: Esta semana · Este mes · 3 meses. Layout grid 3 columnas con pills.

**Props:**

- `value`: `"semana" | "proxima-semana" | "mes" | "trimestre"` _(required)_ — Tab activo.
- `onChange`: `(key: WhenKey) => void` _(required)_ — Callback al cambiar de rango.
- `className`: `string` — Clases extra para el contenedor exterior.

**Responsive:**

- `vertical-mobile`: text-[11px], grid-cols-3, alto mínimo 36px.
- `vertical-tablet`: text-sm (escalado).
- `horizontal-mobile`: Como vertical-mobile, texto compacto.
- `horizontal-desktop`: text-sm.

**Notas:**

- Pill activa: bg km0-blue-600 · texto km0-yellow-400. Nunca usar otros colores.

### EventCard

- **Import:** `import EventCard from "@/components/EventCard"`
- **Usado en:** Agenda
- Tarjeta resumen de evento en la lista de Agenda. Muestra título, descripción corta, fecha/hora/lugar, tags y badge de precio/gratis.

**Props:**

- `evento`: `Evento` _(required)_ — Objeto Evento del API event-query.
- `index`: `number` _(required)_ — Índice en la lista (usado para staggered fade-in).

**Responsive:**

- `vertical-mobile`: p-3, título text-sm, iconos 12px.
- `vertical-tablet`: Mismo layout (no escala el card en lista).
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual — la lista decide cuántas columnas.

**Notas:**

- Tags se truncan a 3 (slice(0, 3)).
- Badge gratis (accent) vs precio en € (secondary).

## Chat

### VoiceRecorder

- **Import:** `import VoiceRecorder from "@/components/VoiceRecorder"`
- **Usado en:** Chat (barra de entrada)
- Caja de grabación de voz con Web Speech API. Muestra texto 'Escuchando…', barras animadas, preview parcial truncada y botón Stop. Se monta condicionalmente en lugar del input cuando el usuario activa el micrófono.

**Props:**

- `onTranscript`: `(text: string) => void` _(required)_ — Se llama con el texto final cuando el usuario pulsa Stop y hay resultado.
- `onCancel`: `() => void` _(required)_ — Se llama si Stop sin texto, o si el navegador no soporta SpeechRecognition, o en error.
- `lang`: `"ca" | "es" | "en" | string` — default `"es"` — Idioma de reconocimiento (mapeado a ca-ES / es-ES / en-GB).

**Responsive:**

- `vertical-mobile`: Pill horizontal completa.
- `vertical-tablet`: Igual.
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual.

**Notas:**

- Requiere window.SpeechRecognition o webkitSpeechRecognition. Si no existe, llama a onCancel y muestra alert.
- En la preview del catálogo se renderiza un stub porque pedir micro en docs no tiene sentido.

## Auth

### SocialAuthButtons

- **Import:** `import SocialAuthButtons from "@/components/SocialAuthButtons"`
- **Usado en:** Login, (futuro) Signup
- Par de botones Google + Apple (grid 2 cols) que disparan lovable.auth.signInWithOAuth. Compartido por signup y login. Maneja loading y error con toast.

**Props:**

- `redirectTo`: `string` — default `"/home"` — Path al que volver tras el OAuth (se combina con window.location.origin).

**Responsive:**

- `vertical-mobile`: Grid 2 cols, altura h-12, texto sm.
- `vertical-tablet`: Igual.
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual.

## Overlays

### NotificationsOverlay

- **Import:** `import NotificationsOverlay from "@/components/NotificationsOverlay"`
- **Usado en:** Home
- Overlay deslizante que cubre el frame actual (absolute inset-0, z-50) con la lista de notificaciones. Cada item con dot de estado, título, descripción, tiempo y CTA. Pulsar item navega al link y marca como leído.

**Props:**

- `open`: `boolean` _(required)_ — Controla la visibilidad (con AnimatePresence).
- `notifications`: `AppNotification[]` _(required)_ — Lista a mostrar (orden = orden visual).
- `onClose`: `() => void` _(required)_ — Cerrar overlay.
- `onMarkRead`: `(id: string) => void` _(required)_ — Marcar una notificación como leída.

**Responsive:**

- `vertical-mobile`: Cubre el frame del Home (rounded-3xl heredado).
- `vertical-tablet`: Igual.
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual.

**Notas:**

- Debe montarse DENTRO de un padre `relative` (el frame del Home lo es).
- Estado vacío: muestra mensaje 'No tienes notificaciones'.

## Idioma

### LanguageCard

- **Import:** `import LanguageCard from "@/components/LanguageCard"`
- **Usado en:** Language (Index)
- Card de selección de idioma. Bandera (emoji o imagen) + nombre + descripción + flecha. Estados: idle, selected (borde amarillo), disabled (gris).

**Props:**

- `flag`: `string` _(required)_ — Emoji o URL de bandera (según flagIsImage).
- `flagIsImage`: `boolean` — default `false` — Si true, flag se renderiza como <img>; si no, como emoji.
- `name`: `string` _(required)_ — Nombre del idioma.
- `description`: `string` _(required)_ — Línea secundaria (p.ej. 'Català').
- `selected`: `boolean` — default `false` — Estado seleccionado.
- `disabled`: `boolean` — default `false` — No clicable, grayscale.
- `onClick`: `() => void` — Acción al pulsar (ignorada si disabled).
- `style`: `CSSProperties` — Override puntual de estilos inline (p.ej. animation-delay para stagger).

**Responsive:**

- `vertical-mobile`: Card completo ancho disponible, bandera 12×12, nombre text-lg.
- `vertical-tablet`: Igual.
- `horizontal-mobile`: Igual.
- `horizontal-desktop`: Igual.

---

# KM0 LAB — Identidad visual y uso del documento

## A. Identidad visual (lo que los tokens no cuentan)

- **Logo**: wordmark "KM0 LAB©" en azul marca sobre pastilla amarilla o
  fondo blanco. En código SIEMPRE vía el componente `Km0Logo`; nunca
  recrearlo con texto.
- **Mascota**: robot KM0 (`km0-robot.png`), sonriente, dentro de
  círculos concéntricos teal. Aparece en pantallas de entrada
  (idioma, onboarding) como elemento de bienvenida.
- **Ilustraciones**: estilo 3D isométrico cálido y amable — escenas de
  barrio (comercios, plazas, edificios) con personajes cartoon.
  Paleta coherente con los tokens (beiges cálidos de fondo, teal,
  amarillo, azul marca). Las imágenes nuevas deben seguir este estilo.
- **Composición de pantalla tipo**: fondo beige cálido degradado,
  tarjeta/card blanca de esquinas muy redondeadas con borde azul fino,
  contenido centrado, botón CTA ancho en azul marca con texto en
  mayúsculas.
- **Tono del copy**: cercano y directo, trilingüe (ca/es/en). Títulos
  cortos en mayúsculas con la fuente de marca; subtítulos en fuente de
  texto. El catalán es el idioma por defecto del producto.

## B. Reglas de pantalla (obligatorias en cualquier propuesta)

- Toda pantalla contempla 4 estados: **loading** (skeleton), **empty**
  (bloque con CTA), **error** (mensaje semántico + reintentar) y
  **feliz**. Las pantallas con sesión añaden variantes (guest /
  registered).
- Pantallas "de marca" (entrada, login, configuración) van envueltas en
  `BrandedFrame`; la Home y el Chat usan shell propio con
  `BottomTabs` / fullbleed.
- Diseño mobile-first: base portrait 375×667. Los otros tres puntos de
  la matriz (768×1024, 667×375 smoke, 1280×550) se derivan de ella.
- Navegación con rutas kebab-case; copy nunca hardcodeado (diccionario
  i18n).

## C. Cómo usar este documento en una IA externa

Pega el documento completo como primer mensaje (o system prompt) y
después pide la pantalla con esta plantilla:

```
Con el design system y la identidad visual del documento anterior,
proponme [N] variantes de la pantalla [nombre] para KM0 LAB.

Objetivo de la pantalla: [qué debe conseguir el usuario].
Elementos que debe incluir: [lista en lenguaje de producto].
Estados: propón el estado feliz y describe loading / empty / error
[+ variantes guest/registered si aplica].
Formato de salida: [maqueta HTML+Tailwind autocontenida / descripción
por bloques / código React con los componentes del catálogo].
Restricciones: usa SOLO tokens y componentes del documento; base
portrait 375×667; sin hex crudos; copy de ejemplo en catalán.
```

Para brainstorm rápido pide "descripción por bloques" (barato de
iterar); para validar visualmente pide "maqueta HTML+Tailwind
autocontenida en un solo archivo" (se abre en el navegador sin build);
el código React final solo cuando la propuesta esté decidida, y
generado en Lovable, que ya tiene los componentes reales.
