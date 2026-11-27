# BRIEF — Rediseño de la Home de KM0 LAB

> Briefing reutilizable para pedir propuestas de la Home a cualquier IA
> (Claude, ChatGPT, Lovable, v0…). **Cómo usarlo**: pega primero el
> contenido de `docs/DESIGN-SYSTEM.md` (design system + componentes +
> identidad visual), después este briefing, y al final la línea de la
> ronda que toque (ver §Rondas). Mantener vivo: si cambian los módulos,
> el público o los objetivos, actualizar aquí.

## Contexto y objetivo del producto

KM0 LAB es la app del comercio y la vida de proximidad de un municipio
(piloto: Malgrat de Mar). Conecta a los vecinos con los comercios
locales, la agenda de eventos del pueblo, las noticias municipales y un
asistente de chat con IA. Gamificación con puntos/recompensas (XP) por
participar y comprar local. Producto trilingüe (catalán por defecto,
español, inglés). Se usa sobre todo en el móvil, en momentos cortos del
día a día.

## Público objetivo

Vecinos del municipio de todas las edades, sin perfil técnico: desde
gente joven hasta mayores que usan el móvil con soltura básica. También
turistas/visitantes (de ahí el selector de idioma). Valoran lo cercano,
lo práctico y lo local; desconfían de las apps complicadas.

## La home actual (lo ya construido — reutilizable)

Estructura portrait actual, de arriba abajo:

- **HomeHero**: header fijo con skyline del pueblo de fondo, escudo +
  nombre del municipio, logo KM0 y campana de notificaciones; debajo,
  saludo personalizado (**GreetingBlock** "👋 ¡Hola, {nombre}!") y
  **PointsCard** con los puntos (solo usuarios registrados).
- Cuerpo con scroll: **LoginButton** (solo invitados) → "Accesos
  rápidos" (**HomeModules**: Agenda, Comerços, Ajuntament, Cupons,
  Punts, KM0 CHAT) → "Eventos destacados" (**EventHeroCarousel**) →
  "Descubre lo nuestro" (**ComercioCarousel**) → "Promos para ti"
  (**CouponCard** × N).
- **BottomTabs** fija abajo (home / info / ofertes / perfil; perfil
  solo registrados) + **NotificationsOverlay**.

Estados: guest / registered / reward-welcome, más loading, empty y
error por sección.

## Contenido vivo (viene de API real)

- **Eventos** (agenda): `eventsApi` / fixtures. Cambian a diario, tienen
  imagen, título bilingüe, lugar, hora, precio o "gratuito".
- **Noticias municipales**: `newsApi`. Aún no están en la home; se
  valorará darles sitio.
- Comercios, cupones y puntos: hoy mock; contrato estable.

## Qué debe conseguir la nueva home

1. Que en 5 segundos se entienda qué ofrece la app (eventos de hoy,
   comercios, promos) sin necesidad de registro.
2. Que el usuario invitado tenga un motivo claro para registrarse
   (puntos, promos personalizadas), sin que el login bloquee explorar.
3. Que el contenido vivo (eventos de hoy, noticias) gane protagonismo:
   viene de API real y cambia a diario.
4. Acceso al chat asistente visible siempre.

## Limitaciones (no repetir las de DESIGN-SYSTEM.md)

- Reutilizar componentes del catálogo cuando sirvan; proponer bloques
  nuevos solo con justificación.
- Base portrait 375×667; la home NO usa BrandedFrame (shell propio con
  BottomTabs).
- Copy trilingüe vía i18n; nunca hardcodeado. Ejemplos en catalán.

## Referencias de estilo (opcional, con moderación)

Añadir aquí 1–2 referencias como máximo, diciendo QUÉ se toma de cada
una (p. ej. "de X, la jerarquía del feed de eventos"; NO "hazlo como
X"). Sin referencias, la IA parte solo de la identidad KM0.

## Encargo

Propón una reestructuración de la home REUTILIZANDO los componentes del
catálogo cuando sirvan (di cuáles conservas, cuáles mueves, cuáles
eliminas y qué bloques nuevos propones y por qué). No es una web de
marketing: es la pantalla de inicio de una app de uso diario.

## Rondas (elegir la línea final según la fase)

- **Ronda 1 — divergir (texto, barato)**: "Dame 4 variantes como
  estructura de secciones: para cada una, nombre, idea-fuerza en una
  frase, lista ordenada de bloques (con el componente del catálogo o
  NUEVO), y las diferencias entre guest y registered. Formato texto,
  sin código."
- **Ronda 2 — visualizar (elige 1–2 variantes)**: "Genera la variante
  [X] como un único archivo HTML autocontenido con Tailwind por CDN,
  viewport 375×667, estado registered, copy en catalán, imágenes como
  placeholders con los colores de la paleta. Solo tokens del design
  system."
- **Ronda 3 — construir**: pasar la variante ganadora a Lovable como
  especificación (tiene los componentes reales). Nada de React fuera de
  Lovable.

> Consejo multi-IA: lanza el MISMO prompt idéntico a cada IA (si lo
> adaptas, comparas prompts, no IAs). Pide siempre nombre + idea-fuerza
> por variante: da vocabulario para discutirlas con el PO.
