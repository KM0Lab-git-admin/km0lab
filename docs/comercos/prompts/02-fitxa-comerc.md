# Prompt Lovable · Bloque 2 · Fitxa del comerç (dos estados)

> Pega el bloque siguiente en Lovable junto con la captura del **bloque 2** del mockup
> (`docs/comercos/comercos-mockup.html`). Cubre los dos estados: "Encara no visitat" y
> "Ja escanejat · actiu". Instrucciones en castellano; UI strings en catalán + ES vía i18n.

---

```
Construye la pantalla "Ficha del comercio" (Fitxa del comerç) de KM0 LAB, con sus DOS
estados: "Encara no visitat" y "Ja escanejat · actiu".

▸ CONTEXTO IMPORTANTE
La imagen adjunta es un MOCKUP de referencia, no un diseño final ni pixel-perfect.
Sirve para entender estructura, jerarquía y comportamiento. Decide tú la apariencia
final aplicando nuestro Design System y REUTILIZANDO los componentes que ya existen
en el proyecto (cabecera, Card, Badge, botones, filas de info, bottom sheet/dialog,
skeletons…) y los tokens de color/tipografía/espacios ya definidos. Prioriza la
coherencia con el resto de la app por encima de copiar el mockup. Sigue las reglas del
Knowledge (frontera mock↔producción, portrait-first, DeviceShell, datos mock, i18n).
Si ves una solución de UI/UX mejor que la del mockup, aplícala.

▸ QUÉ ES ESTA PANTALLA
Detalle de un comercio adherido. Se abre al tocar una tarjeta del listado (apartado 1).
Muestra la info del comercio, la acción de ganar puntos escaneando su QR, sus
promociones (informativas) y una descripción. La MISMA pantalla tiene dos estados según
si el vecino ya ha escaneado el QR de ESTE comercio.

▸ LOS DOS ESTADOS (esto es lo importante)
El estado depende de un booleano `visitat` (si el usuario ya escaneó el QR de este
comercio). Implementa ambos y hazlos alternables con el dato mock:

1) NO VISITADO (visitat = false):
   - Tarjeta de acción destacada: "Guanya +{punts} punts · Escaneja el QR del taulell
     en visitar-lo", con botón "Escanejar QR".
   - CTA inferior fijo: "Escanejar QR i guanyar +{punts}".
   - Sin distintivo de visitado.

2) YA ESCANEADO · ACTIVO (visitat = true):
   - Distintivo "✓ Visitat" en la cabecera y un indicador "● Actiu" junto al nombre.
   - La tarjeta de acción pasa a estado "conseguido" (verde/teal): "Ja has guanyat
     +{punts} punts · Has escanejat el QR d'aquest comerç", SIN botón de escanear.
   - CTA inferior fijo: "Veure les promocions del comerç".
   - Recuerda: cada comercio da puntos UNA sola vez, por eso en este estado ya no se
     puede volver a escanear.

▸ ESTRUCTURA (de arriba a abajo, común a ambos estados salvo lo indicado)
1. Cabecera con imagen del comercio + botón "atrás". (NO hay corazón/favoritos NI
   sello "adherido": si está en la app, ya está adherido.)
2. Categoría (pequeña) + nombre del comercio.
3. Línea de estado: abierto/cerrado ahora + hora de cierre + distancia. En estado
   activo, añade "● Actiu".
4. Tarjeta de puntos (los dos estados descritos arriba). El botón "Escanejar QR"
   navega al ESCÁNER GLOBAL (mismo del apartado 1; de momento navega a su ruta, puede
   ser placeholder). No implementes aquí la lógica de escaneo.
5. Lista de información práctica: dirección (con CP y población), horario (con estado
   "Obert ara · tanca a les HH:MM"), teléfono (acción llamar) y web (abrir enlace).
6. Mapa: de momento un placeholder estático con un pin; al tocar, abrir mapa/coordenadas
   (puede quedar como acción pendiente).
7. Sección "Promocions del comerç": lista INFORMATIVA de las ofertas del comercio
   (ej. "5% de descompte · Per compres de +20€", "2×1 en cafès de tarda · De 16 a 19h").
   Son SOLO informativas: sin botón usar, sin código, sin canje ni puntos. Muestra 2-3
   como resumen y un enlace "Veure totes les promocions" que navega a la pantalla de
   promociones (apartado 3; de momento ruta placeholder).
8. Descripción del comercio (texto).
9. CTA inferior fijo (sticky), distinto según estado (ver arriba).

▸ DATOS (MOCK — aún no hay API de comercios; frontera: todo mockeado)
Crea un mock local tipado y renderiza a partir de él. Estructura sugerida:

  type PromocioInfo = {
    id: string
    etiqueta: string      // "-5%", "2×1", "Regal"
    titol: string         // "5% de descompte"
    detall: string        // "En pa i brioixeria"
    condicio?: string     // "Per compres de +20€"
  }
  type ComercDetall = {
    id: string
    nom: string
    categoria: string
    subcategoria?: string
    imatge?: string
    emoji?: string        // fallback visual si no hay imagen
    obertAra: boolean
    horariAvui: string    // "07:00–20:00"
    tancaA?: string       // "20:00"
    adreca: string
    codiPostal: string    // "08380"
    poblacio: string      // "Malgrat de Mar"
    telefon?: string
    web?: string
    coordenades?: { lat: number; lng: number }
    descripcio: string
    punts: number         // puntos que da al escanear su QR
    visitat: boolean      // ← estado: ¿el vecino ya escaneó el QR de este comercio?
    promocions: PromocioInfo[]
  }

Ejemplo mock (Forn Rovira): categoria "Alimentació", subcategoria "Fleca", obertAra
true, horariAvui "07:00–20:00", tancaA "20:00", adreca "Carrer de Mar, 14",
codiPostal "08380", poblacio "Malgrat de Mar", telefon "93 765 00 00",
web "fornrovira.cat", punts 20, descripcio breve de panadería artesanal, y
promocions: [ "5% de descompte / En pa i brioixeria / Per compres de +20€",
"2×1 en cafès de tarda / De 16 a 19 h", "15% en coques de temporada / Juny i juliol" ].
Prepara dos variantes del mock: una con visitat=false y otra con visitat=true, para
poder ver ambos estados.

▸ ESTADOS DE PANTALLA
- Loading: skeleton de cabecera + tarjeta + filas (reutiliza el patrón existente).
- Error: estado de error reutilizable con "Tornar a provar".

▸ i18n
Todos los textos vía nuestro sistema (lib/i18n.ts), con claves para ES y CA. Los textos
visibles del mockup están en catalán; añade también la variante castellana. Nada de
strings hardcoded.

▸ QUÉ NO HACER AHORA
- No implementes la lógica de escaneo ni la validación de puntos (el botón "Escanejar
  QR" solo navega a la ruta del escáner).
- No construyas la pantalla de promociones (solo navegación placeholder desde el enlace
  "Veure totes les promocions").
- Las promociones son SOLO informativas: nada de botón usar, código, canje ni QR de
  beneficio (eso llegará más adelante).
- No pongas favoritos/corazón ni sello "adherido".
- No conectes ninguna API real ni backend; todo con el mock local.
- No introduzcas dependencias nuevas fuera de las aprobadas en el Knowledge.
- No toques nada marcado como producción/locked.

Objetivo: una ficha de comercio limpia y coherente con el Design System, portrait-first,
con datos mock, que muestre correctamente los dos estados (no visitado / ya escaneado ·
activo), la info del comercio, sus promociones informativas y la descripción.
```
