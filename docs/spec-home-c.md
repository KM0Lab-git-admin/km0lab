# SPEC — Home "Missió del barri" (variant C)

> Especificación cerrada con el PO para construir la Home en Lovable
> (Ronda 3). Deriva de `docs/BRIEF-HOME.md` (variante C) y de las
> maquetas de Ronda 2. Decisiones de producto cerradas 2026 (ver
> §Decisiones). La construcción se hace por la secuencia de 3 prompts
> del final; cada prompt respeta `docs/KNOWLEDGE.md`.

## Decisiones de producto (cerradas)

1. **Puntos**: el registro concede **100 puntos de bienvenida**; el
   registrado nunca está a 0. Sin backend de puntos todavía (mock).
2. **Misiones**: bloque **informativo**, no interactivo (sin
   progreso/checks/desbloqueo). Solo explica cómo ganar puntos.
3. **Puntos solo por QR**: hoy la única vía real es escanear QR en
   comercios adheridos. Los eventos NO dan puntos → sin insignias +XP.
4. **Eventos**: datos mock (NO se conecta la API real todavía).
5. **Saludo invitado**: "Hola!" sin nombre (el nombre solo se captura
   al registrarse).
6. **Escáner de QR**: es otra pantalla (acceso a cámara), fuera de este
   spec. La Home solo lleva un botón "Escaneja un QR" que navega a un
   placeholder `/scan`.

## Objetivo

Que el vecino vea su progreso de puntos y entienda cómo ganar más
(escaneando QR en comercios); que el invitado vea el valor y se
registre. Uso diario, móvil, base portrait 375×667.

## Los dos estados (misma pantalla según haya sesión)

Lee sesión y perfil del store existente (`useAppStore` / `useAuth` /
`useProfile`). No son dos pantallas: es la misma, condicionada.

**REGISTRADO**

- Cabecera: saludo con nombre real (GreetingBlock).
- Tarjeta de progreso (evoluciona PointsCard): puntos actuales (mínimo
  100), nivel, barra hacia la próxima recompensa y qué recompensa es.
- Bloque "Com guanyar punts" INFORMATIVO: explica las formas de ganar
  puntos; la activa hoy es escanear QR. Botón "Escaneja un QR" → `/scan`
  (placeholder; NO construir el escáner).
- Esdeveniments destacats: carrusel con datos MOCK (sin +XP).
- "Bescanvia amb punts": sección VISUAL/aspiracional (cupones con su
  coste en puntos, sin canje funcional).

**CONVIDAT (guest)**

- Cabecera: saludo genérico "Hola!" (sin nombre).
- En lugar de la tarjeta de progreso, tarjeta de registro ("Registra't
  i comença a guanyar" + CTA "Crea el teu compte").
- Mismo bloque informativo "Com guanyar punts" (solo info; sin
  candados). El botón de escanear invita antes a registrarse.
- Esdeveniments visibles igual (mock).
- "Bescanvia amb punts": aviso corto "Registra't per bescanviar punts".

## Componentes

Reutiliza (NO recrees): HomeHero, GreetingBlock, EventHeroCarousel,
CouponCard, BottomTabs, NotificationsOverlay y el shell de Home actual.
Evoluciona PointsCard para el modo "progreso con recompensa" (añade
variante, no rompas su API). Crea NUEVO: bloque informativo
EarnPointsInfo (título + lista de formas de ganar puntos + botón
escanear). Nada interactivo con estado.

## Datos (frontera de KNOWLEDGE.md §0 y §6)

- Puntos y perfil: del store (mock). El registro siembra 100 puntos.
- Eventos: datos MOCK desde `@/data` (NO la API real todavía).
- Cupones de canje: mock estático, solo visual.
- Firmas de services mock estables para conectar luego.

## Estados de pantalla (los 4, KNOWLEDGE.md §5)

- loading: skeletons en tarjeta de progreso y carrusel.
- empty: si no hay eventos, el carrusel muestra su empty ("Avui no hi
  ha esdeveniments").
- error: reservado (datos mock, pero deja el patrón).
- reward-welcome: al venir de registrarse, momento de "+100 punts de
  benvinguda" antes de asentar la home registrada.
- Forzables por query param (`?state=` y `?session=`) como PreviewAll.

## Copy — TODO en lib/i18n.ts (claves nuevas ca/es/en; ca de referencia)

| Clave                    | Català                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| home.greeting.registered | "Bon dia, {name} 👋"                                                         |
| home.greeting.guest      | "Hola! 👋"                                                                   |
| home.subtitle.registered | "El teu barri, més a prop"                                                   |
| home.subtitle.guest      | "Descobreix i comença a guanyar punts"                                       |
| home.points.level        | "Nivell {n}"                                                                 |
| home.points.toReward     | "A {n} punts de la propera recompensa: {reward}"                             |
| home.welcome.title       | "Benvingut/da a KM0 LAB! 🎉"                                                 |
| home.welcome.points      | "Has guanyat 100 punts de benvinguda"                                        |
| home.join.title          | "Registra't i comença a guanyar 🎁"                                          |
| home.join.body           | "Acumula punts als comerços del poble i bescanvia'ls per vals i descomptes." |
| home.join.cta            | "Crea el teu compte"                                                         |
| home.join.mini           | "Només et cal un correu · 30 segons"                                         |
| home.earn.title          | "Com guanyar punts"                                                          |
| home.earn.qr             | "Escaneja el QR als comerços adherits"                                       |
| home.earn.scanCta        | "Escaneja un QR"                                                             |
| home.earn.soon           | "Ben aviat, més formes de guanyar punts"                                     |
| home.redeem.title        | "Bescanvia amb punts"                                                        |
| home.redeem.cost         | "{n} pts"                                                                    |
| home.redeem.guest        | "Registra't per bescanviar punts"                                            |

(es/en los completa el equipo; ca es el de referencia.)

## Alcance / intocable

- NO construir el escáner de QR (solo el botón que navega a `/scan`).
- NO tocar el contrato de API (services/apiClient, apiSchemas,
  eventsApi, newsApi, data/fixtures) ni los primitivos de components/ui.
- NO añadir dependencias fuera de la lista aprobada.
- Copy solo en lib/i18n.ts; cero strings en JSX.
- Solo tokens del design system; cero hex; breakpoints semánticos.
- Validar en 375×667 (contrato) y 768×1024; smoke en 667×375.

## Secuencia de construcción (3 prompts a Lovable)

1. **Estructura + copy + los dos estados**, con puntos/eventos/cupones
   como datos mock estáticos. Validar layout de guest y registered en
   PreviewAll.
2. **PointsCard evolucionada + EarnPointsInfo + reward-welcome** (el
   momento de +100 al registrarse).
3. **Estados forzables** (`?state=` / `?session=`) y pulido de
   loading/empty/error en las 4 resoluciones.
