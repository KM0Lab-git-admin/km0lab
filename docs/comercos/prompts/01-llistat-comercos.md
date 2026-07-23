# Prompt Lovable · Bloque 1 · Llistat de comerços adherits

> Pega el bloque siguiente en Lovable junto con la captura del **bloque 1** del mockup
> (`docs/comercos/comercos-mockup.html`). Instrucciones en castellano; UI strings en
> catalán + variante ES vía i18n.

---

```
Construeix la pantalla "Llistat de comerços adherits" (secció Comerços) de KM0 LAB.

▸ CONTEXT IMPORTANT
La imatge adjunta és un MOCKUP de referència, no un disseny final ni pixel-perfect.
Serveix per entendre l'estructura, la jerarquia i el comportament. Tu decideixes
l'aparença final aplicant el nostre Design System i REUTILITZANT els components que
ja existeixen al projecte (Card, Badge, botons, bottom nav, sheet/dialog, etc.) i els
tokens de color/tipografia/espais ja definits. Prioritza coherència amb la resta de
l'app per sobre de copiar el mockup. Segueix les regles del Knowledge (frontera
mock↔producció, portrait-first, DeviceShell, dades mock, i18n). Si detectes una
millor solució d'UI/UX que la del mockup, aplica-la.

▸ QUÈ ÉS AQUESTA PANTALLA
Llista dels comerços del poble adherits al programa de punts. El veí els descobreix,
els pot filtrar per categoria, i des d'aquí accedeix a l'escàner de QR. En tocar una
targeta s'obrirà la fitxa del comerç (pantalla que farem després: de moment,
navegació a una ruta placeholder).

▸ ESTRUCTURA (de dalt a baix)
1. Capçalera de l'app ja existent (poble "Malgrat de Mar" + logo + campana). Reutilitza
   la que ja fem servir a altres pantalles; no en creïs una de nova.
2. Títol "Comerços adherits" + subtítol amb el total ("32 establiments participen al
   programa"). El número surt de les dades.
3. Filtre de CATEGORIA com a DESPLEGABLE (no cercador — no volem cercador de moment).
   Botó "Totes les categories ▾" que obre un panell (sheet/dialog) amb la llista
   completa de categories, cada una amb el seu comptador. Selecció ÚNICA per ara
   (una categoria o "totes"). Al costat del botó, comptador de resultats visibles.
   Motiu del desplegable: hi haurà moltes categories, els xips no escalen.
4. Llista de targetes de comerç (una sota l'altra).
5. Botó flotant central (FAB) que obre l'ESCÀNER de QR. És un escàner GLOBAL:
   s'obre des d'aquí sense entrar a cap fitxa. De moment navega a la ruta de
   l'escàner (pot ser placeholder si encara no existeix).
6. Bottom navigation ja existent, amb la pestanya "Comerços" activa. Si ja hi ha una
   tab bar al projecte, integra-hi aquesta entrada; no dupliquis navegació.

▸ TARGETA DE COMERÇ (cada ítem)
- Imatge/miniatura (si no n'hi ha, un placeholder amb inicial o icona de categoria).
- Etiqueta de categoria (petita, sobre el nom).
- Nom del comerç (destacat).
- Ubicació curta (adreça).
- Distància (p. ex. "240 m").
- Badge de punts que ofereix (p. ex. "+20 pts").
- Indicador "QR" (aquest comerç dona punts escanejant).
Tot això és orientatiu: ordena-ho i estilitza-ho com millor funcioni amb els nostres
components i llegibilitat.

▸ DADES (MOCK — encara no hi ha API de comerços; frontera: tot mockejat)
Crea un mock local tipat i renderitza a partir d'ell. Estructura suggerida:

  type Comerc = {
    id: string
    nom: string
    categoriaSlug: string
    categoriaNom: string
    adreca: string
    distanciaM: number
    punts: number
    teQR: boolean
    imatge?: string
    emoji?: string        // fallback visual si no hi ha imatge
  }
  type Categoria = { slug: string; nom: string; count: number; emoji?: string }

Mock de comerços (mínim 6-8): Forn Rovira (alimentació, C. de Mar 14, 240m, +20),
Cafè del Mar (restauració, Pg. Marítim 3, 310m, +15), Cal Sastre (moda, C. Girona 22,
480m, +25), Floristeria Nom (serveis, Pl. Catalunya 1, 520m, +20), i afegeix-ne
2-4 més coherents.
Mock de categories amb comptador: Totes (32), Alimentació (8), Restauració (6),
Serveis (5), Moda (4), Salut i bellesa (3), Llar i decoració (2), Cultura i lleure (2),
Esports (1), Tecnologia (1).
Punts i distàncies són valors mock; no calculis res real.

▸ ESTATS
- Loading: skeletons de targetes (reutilitza el patró de skeleton ja existent).
- Empty (cap comerç en una categoria): missatge amable + acció per treure el filtre.
- Error: estat d'error reutilitzable amb botó "Tornar a provar".

▸ i18n
Tots els textos via el nostre sistema d'i18n (lib/i18n.ts), amb claus per a ES i CA.
Els textos visibles del mockup estan en català; afegeix també la variant castellana.
No deixis strings hardcoded a la pantalla.

▸ QUÈ NO FER ARA
- No implementis la lògica d'escaneig ni la validació de punts (només navegació a
  la ruta de l'escàner).
- No construeixis la fitxa del comerç (només navegació placeholder en tocar targeta).
- No connectis cap API real ni backend; tot amb el mock local.
- No introdueixis dependències noves fora de les aprovades al Knowledge.
- No toquis res marcat com a producció/locked.

Objectiu: una pantalla neta, coherent amb el Design System, portrait-first, amb dades
mock, filtre desplegable de categoria, targetes de comerç i accés a l'escàner global.
```
