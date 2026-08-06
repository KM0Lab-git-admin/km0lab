# Traspaso · Sección "Comerços" (mockups → prompts de Lovable)

> Documento de continuidad para otra instancia de IA (posiblemente otra cuenta,
> arranque en frío). Con esto puedes seguir generando los **prompts de Lovable**
> de la sección Comerços sin contexto previo de la conversación.

## 0. Qué estamos haciendo

Estamos diseñando la **sección Comerços** de la app KM0 LAB (app de comercio de
proximidad de Malgrat de Mar) **pantalla a pantalla**, con este flujo:

1. Se construye un **mockup HTML** de todas las pantallas de la sección (fuente de
   verdad visual y funcional). → `docs/comercos/comercos-mockup.html`
2. El PO revisa el mockup y pide cambios; se iteran sobre el HTML.
3. Cuando una pantalla se da por buena, se genera un **prompt de Lovable** para que
   Lovable la construya en el repo prototipo (`km0lab-lovable`), respetando el
   Design System. → `docs/comercos/prompts/`
4. Más adelante ese código se porta a producción (`km0lab`) con el flujo de
   `docs/PORTING-FROM-LOVABLE.md`.

**Tu tarea de continuidad:** generar los prompts de Lovable que faltan (bloques 3–6),
siguiendo el mismo formato y las decisiones ya tomadas.

## 1. Fuente de verdad: el mockup

`docs/comercos/comercos-mockup.html` — un solo HTML autónomo, con los tokens KM0
reales, frame phone 375×667 y frames de escritorio para el back-office. Ábrelo en el
navegador para ver las pantallas. Está en **catalán** (idioma de contenido de la app).

Contiene **6 bloques numerados**:

| #   | Bloque                               | Estado prompt                               | Notas                                                                                                                |
| --- | ------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Llistat de comerços adherits         | ✅ hecho → `prompts/01-llistat-comercos.md` | Sin buscador. Filtro de categoría **desplegable**. Escáner **global** (botón central).                               |
| 2   | Fitxa del comerç                     | ✅ hecho → `prompts/02-fitxa-comerc.md`     | Dos estados: **no visitat** vs **ja escanejat · actiu**.                                                             |
| 3   | Promocions del comerç (vista usuari) | ⬜ pendiente                                | Promociones **solo informativas** (sin canje/código).                                                                |
| 4   | Procés d'escaneig del QR — estats    | ⬜ pendiente                                | Lectura · validació · error · èxit. QR de **puntos** (visitar → escanear).                                           |
| 5   | Confirmació de punts obtinguts       | ⬜ pendiente                                | Pantalla de celebración tras escaneo correcto.                                                                       |
| 6   | Backoffice del comerç (web)          | ⬜ pendiente                                | Dos vistas: **El meu QR** y **Promocions** (alta/edición/activación). Es **escritorio** (repo propio `km0lab-backoffice`). |

## 2. Decisiones funcionales ya tomadas (respétalas en los prompts)

- **QR de puntos**: cada comercio tiene un **QR único físico en su mostrador**. El
  vecino lo escanea al visitar y gana **puntos fijos por comercio**, **una sola vez por
  comercio** (segunda vez → error "Ja has visitat aquest comerç"). **Sin GPS**: el QR
  solo está físicamente en la tienda, así que escanearlo ya prueba la visita.
- **Escáner global**: se abre desde el listado (botón central) o desde cualquier sitio,
  **sin entrar a la ficha**; el QR único identifica el comercio.
- **Promociones = SOLO informativas** (versión simple actual): el comercio anuncia
  ofertas (ej. "5% por compras de +20€", "2×1 de tarde", "bebida de regalo"). El usuario
  las ve; **no hay botón usar, ni código, ni validación, ni canje por puntos**. El canje/
  validación por QR de las promociones **se aplaza** ("los QR de beneficios, más adelante").
- **Puntos vs promociones**: son cosas distintas. Los puntos se ganan escaneando el QR
  y se canjean en una sección de **Recompenses** aparte (fuera de esta sección). Las
  promociones no gastan puntos.
- **Back-office = web/escritorio** (repo propio `km0lab-backoffice`); también usable
  en móvil/tablet por ser web responsivo.
- **Sin favoritos** (no hay corazón) y **sin sello "adherit"** (si el comercio está en la
  app, ya está adherido) — no los pongas en ninguna pantalla.

### ⚠️ Cuestión abierta (confirmar con el PO antes de los prompts 4–6)

El PO dijo "los QR más adelante". Se interpretó como aplazar **la validación/canje por QR
de las promociones** (ya quitado del mockup), pero se **mantuvo el QR de puntos**
(bloques 4, 5 y "El meu QR" del back-office) porque el estado "ja escanejat · actiu" de la
ficha depende de él. **Si el PO quería aplazar TODO el sistema de puntos por escaneo**, los
bloques 4, 5 y la vista "El meu QR" quedarían fuera del MVP. **Pregúntaselo antes de
generar esos prompts.**

## 3. Anatomía del prompt de Lovable (plantilla a replicar)

Los prompts se escriben en **castellano** (idioma del PO), pero las **UI strings visibles**
van en **catalán** (contenido por defecto de la app) + variante ES vía i18n. Mira
`prompts/01-llistat-comercos.md` y `prompts/02-fitxa-comerc.md` como referencia. Estructura:

1. **Título** — qué pantalla construir (y estados si los hay).
2. **Contexto importante** — "es un MOCKUP de referencia, no pixel-perfect; reutiliza el
   Design System y los componentes existentes; decide tú la UI/UX final; sigue el
   Knowledge; portrait-first; DeviceShell; datos mock; i18n".
3. **Qué es esta pantalla** — propósito y de dónde se llega.
4. **Estados** (si aplica) — describe cada estado y qué los diferencia.
5. **Estructura** (de arriba a abajo) — secciones/componentes.
6. **Datos (MOCK)** — tipos TypeScript + ejemplo. Frontera: **todo mockeado**, aún no hay
   API de comercios.
7. **Estados de pantalla** — loading (skeleton), empty, error.
8. **i18n** — todos los textos vía `lib/i18n.ts`, claves ES + CA, nada hardcoded.
9. **Qué NO hacer** — no lógica real de escaneo/validación (solo navegación placeholder),
   no construir otras pantallas, no conectar API, no dependencias nuevas fuera del
   Knowledge, no tocar producción/locked.
10. **Objetivo** — frase resumen.

## 4. Reglas vinculantes y referencias (leer antes de generar prompts)

- `docs/LOVABLE-KNOWLEDGE.md` — contrato que Lovable tiene en su "Knowledge" (frontera
  mock↔producción, portrait-first, DeviceShell = phone centrado, deps aprobadas, i18n en
  `lib/i18n.ts`, modo no técnico). **Manda sobre todo lo demás.**
- `AGENTS.md` — arquitectura, estilos, naming, imports, mapping de rutas de porte.
- `docs/START-HERE-AI.md` — contexto de los repos y el flujo Lovable ↔ producción.
- `docs/PORTING-FROM-LOVABLE.md` — cómo se porta después el código de Lovable a producción
  (manifest `scripts/lovable-manifest.json`).
- `docs/DESIGN-SYSTEM.md` — tokens y componentes (`pnpm design:doc` lo regenera).
- `docs/CONVENTIONS.md` — breakpoints y detalles.

## 5. Estado del código / repos

- **Ubicación**: esta carpeta `docs/comercos/` está en **`develop`** de
  `KM0Lab-git-admin/km0lab` (y también en la rama `claude/session-li6k16`). Puedes
  leerla directamente desde `develop`.
- **Para código nuevo**: trabaja en tu propia rama. El PO trabaja en `develop` en
  paralelo, así que evita commits de código que puedan colisionar (los docs no colisionan).
- **Repos**: `km0lab` (producción, este repo), `km0lab-lovable` (prototipo Lovable),
  `events-query` (API de eventos/noticias, read-only), `km0lab-api` (backend de la app).
  Detalle en `docs/START-HERE-AI.md` y `docs/BACKEND.md`.

## 6. Siguiente paso sugerido

1. Confirmar con el PO la **cuestión abierta** de §2 (¿aplazar todo el QR de puntos?).
2. Generar `prompts/03-promocions-usuari.md` (bloque 3, promociones informativas — el más
   sencillo y sin depender de la cuestión abierta).
3. Según la respuesta del PO, generar 04 (escaneig), 05 (confirmació) y 06 (backoffice).
