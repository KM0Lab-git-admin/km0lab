# Plan de portabilidad Lovable → km0lab — v2 (13-sep-2026)

> **Esta versión sustituye a la v1 de este mismo archivo.** La v1 se escribió contra un clon local de `km0lab-lovable` desactualizado en 66 commits y subestimaba el alcance: decía que lo único pendiente era `EmailOtpTemplate.tsx`. Es falso. No ejecutes nada basándote en la v1.

Runbook autocontenido: asume que quien lo ejecuta no ha visto la conversación en la que se generó. Complementa a `docs/PORTING-FROM-LOVABLE.md` (el proceso general); aquí está lo concreto de esta ronda, con los comandos exactos, los valores verificados y las trampas del entorno.

---

## 1. Estado verificado de partida

Comprobado el 13-sep-2026:

|                       |                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `km0lab-lovable` HEAD | `5d786c9` "Mostró la ilustración del paso 5" (2026-09-13 15:43 UTC), rama `main`, **ya sincronizado con origin** |
| `km0lab` HEAD         | `cfa9757`, rama `develop`, **0 commits por detrás de `origin/develop`**                                          |
| Último porte anterior | cubría hasta `d54aa2a` (2026-08-03). Todo lo posterior es lo que hay que portar ahora                            |
| Dry-run del sync      | **107 archivos, 0 fallos, 0 errores** (ejecutado con el manifest ya corregido, ver §4)                           |

Ramas: `km0lab` ya está limpio (solo `develop`/`main`, local y remoto). En `km0lab-lovable` quedan dos ramas remotas por borrar (`origin/claude/portrait-only-phase2`, `origin/claude/portrait-only-responsive`) — **no se pueden borrar desde el shell de la sesión** (ver §2.4); las borra el usuario.

---

## 2. Trampas del entorno — LEER ANTES DE EJECUTAR

Estas seis cosas han fallado ya en la práctica. No son teóricas.

**2.1. `pnpm` no está en el PATH del shell.** Usa `corepack pnpm ...` para todo (`corepack pnpm sync:lovable`, `corepack pnpm validate`, etc.). El repo declara `packageManager: pnpm@10.19.0` y corepack lo resuelve bien. Node del shell es v22 y `engines` pide 20.x: sale un `WARN Unsupported engine` que es inocuo.

**2.2. Ruido CRLF/LF — el riesgo más serio de este porte.** `km0lab` **no tiene `.gitattributes` y `core.autocrlf` está sin configurar**. Por eso `git status` muestra ~112 archivos modificados que **no tienen ningún cambio real de contenido**, solo finales de línea. Consecuencias:

- **Nunca uses `git add -A` / `git add .`** en este repo: meterías ~112 archivos de basura de line-endings en el commit.
- Para saber qué cambió de verdad: `git diff -w --stat` (ignora espacios). Si un archivo no aparece ahí, su "modificación" es ruido.
- Añade al commit **solo rutas explícitas**, archivo por archivo.
- Lo mismo pasa en `km0lab-lovable`. Si un `git pull` falla con "Your local changes would be overwritten", comprueba primero con `git diff -w --stat -- <archivos>` que el diff real está vacío y solo entonces haz `git checkout -- <archivos>` y reintenta.

**2.3. `.git/index.lock` huérfano.** El montaje del disco de Windows en la VM deja a veces un `index.lock` que git no puede borrar solo (`Operation not permitted`) y que bloquea `pull`/`commit`. Si aparece: borra `/.git/index.lock` a mano y reintenta. Si el `rm` da `Operation not permitted`, hay que pedir permiso de borrado para la carpeta antes.

**2.4. El shell no tiene credenciales de git para _push_.** `git fetch`/`pull` por HTTPS funcionan (son públicos o cacheados), pero cualquier `git push` falla con `could not read Username for 'https://github.com'`. No hay `gh` ni `ssh-agent`. **Todo lo que implique push (subir la rama, borrar ramas remotas, abrir el PR) lo hace el usuario desde su terminal.** No intentes rodearlo.

**2.5. El CDN de Lovable está bloqueado por la política de red.** Verificado: `https://…lovable.app/…` devuelve **403 desde el proxy** tanto en el shell de la VM como en el contenedor de la sesión. `github.com` y `raw.githubusercontent.com` sí funcionan (HTTP 200). Como **todas** las entradas CDN de `assets-manifest.json` apuntan a `lovable.app`, **`pnpm sync:assets` no se puede ejecutar desde esta sesión**: lo ejecuta el usuario desde su propio terminal de Windows. Ver §8.

**2.6. No ejecutes `pnpm install` desde el shell de la sesión.** El `node_modules`
del repo está instalado **con binarios de Windows** (`@esbuild+win32-x64`,
`@rollup+rollup-win32-x64-msvc`). pnpm, corriendo en la VM Linux, detecta el
desajuste y quiere borrar y reinstalar el directorio de módulos; si le dejas,
sustituye esos binarios por los de Linux y **rompe el entorno de desarrollo en
Windows del usuario**. Consecuencia práctica: `pnpm install`, `pnpm validate`,
`pnpm type:check`, `pnpm lint:fix`, `pnpm dev` y `pnpm build` **se ejecutan en el
terminal de Windows del usuario, no aquí**. Lo que sí funciona en la sesión es
`pnpm sync:lovable` (es `node scripts/sync-lovable.mjs`, sin dependencias) y el
compilador de TypeScript invocado a mano
(`node node_modules/.pnpm/typescript@*/node_modules/typescript/bin/tsc`), que es
JS puro — útil para comprobaciones aisladas.

---

## 3. Alcance real de esta ronda

### 3.1. Pantallas nuevas (no existen en `km0lab`)

| Archivo Lovable                  | Destino                                      | Qué es                                                                                                                                                                           |
| -------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/HowItWorks.tsx`       | `apps/km0lab/src/pages/HowItWorks.tsx`       | Carrusel explicativo "Com funciona?" de 5 pasos, ruta `/how-it-works`. Reutiliza `StackCarousel` + `BrandedFrame`. Se entra desde un enlace nuevo en la Home y acaba en `/login` |
| `src/data/howItWorksSteps.ts`    | `apps/km0lab/src/data/howItWorksSteps.ts`    | Estructura de los 5 pasos (orden, icono lucide, panel de color, claves i18n tipadas). El copy vive en `i18n.ts`                                                                  |
| `src/pages/EmailOtpTemplate.tsx` | `apps/km0lab/src/pages/EmailOtpTemplate.tsx` | Maqueta visual del email OTP de 6 dígitos, ruta `/email/otp`                                                                                                                     |

**Ninguna de las tres está documentada en `km0lab-lovable/docs/PORTABILITY-CHANGELOG.md`.** Ese changelog va por detrás del código; no lo uses como fuente única de alcance — la fuente de verdad es el diff `d54aa2a..5d786c9`.

### 3.2. Pantallas y componentes existentes con cambios relevantes

| Archivo                                                                   | Qué cambia                                                                                                                                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/Onboarding.tsx` (+83/-)                                            | Rediseño a imagen dominante a pantalla completa, sin huecos verticales (changelog §7)                                                                                        |
| `components/StackCarousel.tsx` (130 líneas)                               | Reescritura del carrusel + flechas en alto contraste sobre ilustraciones blancas (changelog §8)                                                                              |
| `data/onboardingSlides.ts`                                                | Pasa a los 5 assets nuevos de onboarding                                                                                                                                     |
| `pages/Language.tsx` (80 líneas)                                          | Quita la mascota robot y `FloatingDots`; ilustración nueva `language-selection.png`; nombres/descripciones de idioma pasan a claves i18n. **No documentado en el changelog** |
| `pages/PostalCode.tsx`                                                    | Cambia `km0_city_map.png` (borrado del repo) por `postal-code-map.png` con alt-text i18n. **No documentado en el changelog**                                                 |
| `components/HomeContent.tsx`, `components/JoinCard.tsx`, `pages/Home.tsx` | Enlace y handler `onHowItWorks` → `/how-it-works`                                                                                                                            |
| `lib/i18n.ts` (+92)                                                       | Claves nuevas: `email_otp.*`, `how_it_works.*`, `language.*`, `postal.image_alt`, etc.                                                                                       |

**El i18n NO se fusiona a mano.** `src/lib/i18n.ts` está en el manifest y el sync sobrescribe entero `packages/app/utils/i18n.ts`. (La v1 de este plan decía lo contrario: era un error.) Sí hay que **verificar** después que el diff de ese archivo solo añade claves y no borra ninguna que producción hubiera añadido por su cuenta — ver §9.

### 3.3. Assets (mecanismo puntero CDN)

Lovable ya no versiona algunos binarios: deja un puntero `<nombre>.<ext>.asset.json` con la URL de su CDN, y el código hace `import x from '@/assets/foo.png.asset.json'` y usa `x.url`. En producción esto **ya está resuelto**: el plugin `lovableAssetPointer()` de `apps/km0lab/vite.config.ts` reescribe ese import al binario local `apps/km0lab/src/assets/foo.png`. No hay que tocar nada del mecanismo — **solo hace falta que el binario exista en disco**.

Punteros que el código portado importará y cuyo binario **todavía no existe** en `km0lab` (12):

```
how-it-works/step1.png … step5.png
language-selection.png
postal-code-map.png
onboarding/onboarding-neighborhood-shop.png
onboarding/onboarding-local-updates.png
onboarding/onboarding-slide-3.png … slide-5.png
```

Sin estos 12 binarios **el build falla** (el plugin resuelve a un archivo inexistente). Ya existen y no hay que tocar: `rewards-icon.png`, `shop-services-icon.png`.

Quedan huérfanos tras el porte (nadie los importa ya; **no los borres**, son inocuos y no entran al bundle): `apps/km0lab/src/assets/km0_city_map.png` y `apps/km0lab/src/assets/onboarding/0{1..5}_*.jpg`.

---

## 4. Estado de ejecución (13-sep-2026)

Parte del plan **ya está ejecutada**. Lee esto antes de repetir pasos.

**Hecho y commiteado** en `develop`:

- `83b89c8` — `fix(app): cierra sesion si el token ha caducado`: los 3 archivos
  de sesión/auth que estaban sueltos (`useAuth.ts`, `useMyShops.ts`,
  `km0labClient.ts`), en su propio commit y separados del porte.

**Hecho, sin commitear**, en la rama `feature/sync-lovable-how-it-works-onboarding`:

- `scripts/lovable-manifest.json`: 3 entradas nuevas en `files`
  (`EmailOtpTemplate.tsx`, `HowItWorks.tsx`, `howItWorksSteps.ts`) y
  `packages/app/utils/i18nProd.ts` añadido a `locked`.
- `scripts/assets-manifest.json`: fuera las 4 entradas obsoletas, dentro las 12
  nuevas del CDN.
- `pnpm sync:lovable` ejecutado de verdad: **107 archivos, 0 fallos, 0 errores**.
- `apps/km0lab/src/App.tsx`: rutas `/how-it-works` (con `RequireSetup
need="location"`) y `/email/otp` (sin guard) añadidas.
- `packages/app/utils/i18nProd.ts` creado y barrel `utils/index.ts` ajustado —
  ver §4.1.
- `docs/PORTING-FROM-LOVABLE.md`: documentado el overlay de i18n en §12.4.

**Pendiente** (todo requiere el terminal de Windows del usuario, ver §2.6):
`pnpm sync:assets`, `pnpm install` + `pnpm validate` + `pnpm lint:fix`, QA visual,
`push` y PR.

### 4.1. El overlay de i18n (decisión tomada en esta ronda)

El sync destruía 52 claves de i18n que solo existían en producción, porque
`packages/app/utils/i18n.ts` es propiedad de Lovable y se sobrescribe entero.
Entre ellas, `shopCategories.*`, que `shopMapper.ts` construye dinámicamente con
`as TKey`: no daba error de compilación, solo se rompía en runtime mostrando la
clave cruda en la UI.

Solución aplicada: las 52 claves viven ahora en `packages/app/utils/i18nProd.ts`
(marcado `locked`), que fusiona su diccionario con el de Lovable y reexporta
`t`/`TKey`. El barrel `utils/index.ts` reexporta explícitamente desde el overlay,
lo que tiene precedencia sobre el `export *` del módulo de Lovable. Los
componentes portados no se tocan. Detalle completo y regla de mantenimiento en
`docs/PORTING-FROM-LOVABLE.md` §12.4.

Verificado con `tsc` aislado: resuelve claves de producción, claves de Lovable y
claves nuevas de este porte, y sigue rechazando claves inexistentes.

## 5. Fase 1 — Pre-flight

```bash
# 1. Confirmar que los dos repos están al día (esto es lo que falló la vez anterior)
cd ~/mnt/KM0_Lab/km0lab-lovable && git fetch origin main && git log HEAD..origin/main --oneline
#    → debe salir VACÍO. Si no, haz git pull antes de seguir (ojo §2.2 y §2.3).
cd ~/mnt/KM0_Lab/km0lab && git fetch origin develop && git log HEAD..origin/develop --oneline
#    → debe salir VACÍO.

# 2. Fotografiar el estado real del árbol de km0lab (ignorando ruido CRLF)
git diff -w --stat
git status --porcelain=v1 | grep '^??'
```

Antes de tocar el porte, decidir con el usuario qué se hace con lo que ya había suelto en `km0lab` (no lo resuelvas solo):

- Los 3 archivos de sesión/auth de §4 → lo natural es commitearlos aparte, en su propio commit, antes de empezar.
- Assets sin trackear (`Antique-Olive-Std-*.ttf`, `Logos.svg`, `hero-malgrat.jpg`, `km0_chat_*`, `km0_xat_*`, `km0_language_v1.jpg`, `mock-hero-event.png`, `mockups/`, `placeholder.svg`): ninguno lo importa ningún componente actual. No los metas en el commit del porte.
- `apps/km0lab/src/pages/ComercDetall.tsx.head`: extensión inválida, resto de una edición interrumpida. Preguntar antes de borrar.

---

## 6. Fase 2 — Sync de código

```bash
cd ~/mnt/KM0_Lab/km0lab

# Dry-run primero, SIEMPRE
corepack pnpm sync:lovable -- --dry-run --source ../km0lab-lovable
# Esperado: "Resumen: 107 sincronizados, 0 con fallo, 0 errores a resolver."
# El único ⚠ esperado es el de @/data/mockPostalCodes (informativo: ese archivo
# ya tiene su "to" explícito hacia packages/app/data y se sincroniza bien).

# Sync real
corepack pnpm sync:lovable -- --source ../km0lab-lovable

# Revisar QUÉ cambió de verdad
git diff -w --stat
```

Si el script termina con exit 1, **los archivos se escriben igualmente** pero no se commitea nada hasta resolver cada `✗` del informe.

El script hace solo: reescribe imports por zona de destino (`@/components/ui/x` → `@km0lab/ui`, `@/hooks|services|types|lib` → `@km0lab/app`, relativos dentro de `packages/`), añade exports que falten a los barrels, verifica que toda dependencia npm importada existe en el `package.json` de destino y que toda variante responsive usada está definida en `tailwind.config.js`. Lo que **no** hace: rutas, assets, instalar deps, validar.

---

## 7. Fase 3 — Rutas en `App.tsx`

El script sugiere un slug genérico para las pantallas nuevas; **ignóralo y usa los slugs reales de Lovable** (verificados en su `src/App.tsx`): `/how-it-works` y `/email/otp` (el script propone `/email-otp-template`, que es incorrecto).

En producción las rutas van envueltas en guards (`RequireSetup need="language"|"location"` y `RequireAuth`), cosa que en Lovable no existe. Añadir en `apps/km0lab/src/App.tsx`:

```tsx
// junto al resto de lazy imports
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const EmailOtpTemplate = lazy(() => import('./pages/EmailOtpTemplate'))
```

```tsx
{
  /* "Com funciona?" se entra desde la Home, que ya exige need="location" */
}
;<Route
  path="/how-it-works"
  element={
    <RequireSetup need="location">
      <HowItWorks />
    </RequireSetup>
  }
/>

{
  /* Plantilla de email: preview de diseño, no forma parte del funnel → sin guard */
}
;<Route path="/email/otp" element={<EmailOtpTemplate />} />
```

Estas dos elecciones de guard son criterio, no mecánica: están razonadas pero conviene confirmarlas (ver §11).

---

## 8. Fase 4 — Assets

**Bloqueador conocido: esto no se puede ejecutar desde la sesión** (§2.5). `pnpm sync:assets` descarga cada asset y todas las entradas CDN apuntan a `lovable.app`, que el proxy corta con 403. Falla entero, no parcialmente (`scripts/sync-assets.mjs` hace `process.exit(1)` al primer fallo). Los pasos de preparación sí se pueden hacer aquí; la descarga la ejecuta el usuario en su terminal de Windows.

**8.1. Quitar 4 entradas obsoletas de `scripts/assets-manifest.json`** — apuntan a archivos que Lovable ya ha borrado, y provocarían un 404 que aborta todo el sync:

```
src/assets/km0_city_map.png
src/assets/onboarding/03_punts_recompenses.jpg
src/assets/onboarding/04_assistent_247.jpg
src/assets/onboarding/05_municipi_sostenible.jpg
```

**8.2. Añadir las 12 entradas nuevas.** El `from` es la URL absoluta del CDN = base + el campo `url` del `.asset.json` correspondiente; el `to` es la misma ruta que importa el código, sin el sufijo `.asset.json`. Base usada por las entradas ya existentes:

`https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app`

```json
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/dcb290e0-de9c-4748-a4c5-19059c27d779/how-it-works-step1.png", "to": "apps/km0lab/src/assets/how-it-works/step1.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/56ab9de5-a294-477d-bcc1-173f8fd9dca3/how-it-works-step2.png", "to": "apps/km0lab/src/assets/how-it-works/step2.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/606643e6-e028-4d54-b336-b32d916445d9/how-it-works-step3.png", "to": "apps/km0lab/src/assets/how-it-works/step3.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/d7dd328c-b5c4-466d-b317-1e432e4d8140/how-it-works-step4.png", "to": "apps/km0lab/src/assets/how-it-works/step4.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/0e455669-ebbc-4c50-b674-5f02cd62941a/how-it-works-step5.png", "to": "apps/km0lab/src/assets/how-it-works/step5.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/8331304a-67e2-4a42-bd9c-2ef7ff232f47/language-selection.png", "to": "apps/km0lab/src/assets/language-selection.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/a4c98754-a813-49bf-bcc8-d9362a5f05ba/postal-code-map.png", "to": "apps/km0lab/src/assets/postal-code-map.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/17ec3fa1-81b4-4f9a-b883-ead35d747435/onboarding-neighborhood-shop.png", "to": "apps/km0lab/src/assets/onboarding/onboarding-neighborhood-shop.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/71e565a8-a36e-4968-8036-c7558b9f6062/onboarding-local-updates.png", "to": "apps/km0lab/src/assets/onboarding/onboarding-local-updates.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/3680578f-30e6-48d0-b4ae-5bdedc0fc50e/onboarding-slide-3.png", "to": "apps/km0lab/src/assets/onboarding/onboarding-slide-3.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/8582e63c-db1a-4fd6-a927-d9e2c0add612/onboarding-slide-4.png", "to": "apps/km0lab/src/assets/onboarding/onboarding-slide-4.png" },
{ "from": "https://id-preview-3abd47d5--e1c45761-2b09-4860-8947-e5d4e745134c.lovable.app/__l5e/assets-v1/dfa5daac-28e5-44bf-832d-9799f1c11205/onboarding-slide-5.png", "to": "apps/km0lab/src/assets/onboarding/onboarding-slide-5.png" }
```

(Los UUID salen del campo `url` de cada `.asset.json` en `km0lab-lovable`; si alguna descarga da 404, es que el host de preview de Lovable ha cambiado: hay que coger la URL vigente del proyecto en Lovable.)

**8.3. Descarga (la ejecuta el usuario):**

```bash
cd <ruta a km0lab>
pnpm sync:assets
```

**8.4. Verificar que los 12 binarios están en disco** antes de dar por buena la fase:

```bash
cd ~/mnt/KM0_Lab/km0lab
for f in how-it-works/step1 how-it-works/step2 how-it-works/step3 how-it-works/step4 how-it-works/step5 \
         language-selection postal-code-map \
         onboarding/onboarding-neighborhood-shop onboarding/onboarding-local-updates \
         onboarding/onboarding-slide-3 onboarding/onboarding-slide-4 onboarding/onboarding-slide-5; do
  [ -s "apps/km0lab/src/assets/$f.png" ] && echo "OK  $f" || echo "FALTA $f"
done
```

Fuentes: los 9 `.ttf` de Antique Olive ya están en el árbol de `km0lab` (sin trackear). No forman parte de esta ronda; trátalos aparte.

---

## 9. Fase 5 — Validación

```bash
cd ~/mnt/KM0_Lab/km0lab
corepack pnpm install          # solo si el sync reportó deps nuevas
corepack pnpm lint:fix         # fusiona imports duplicados de @km0lab/*
corepack pnpm validate         # type:check + lint + format:check → debe salir verde
corepack pnpm dev              # http://localhost:5173
```

Revisiones específicas de esta ronda, además de la checklist estándar de `PORTING-FROM-LOVABLE.md` §8:

- **`git diff packages/app/utils/i18n.ts`**: debe **añadir** claves, no borrar. Si borra alguna que producción tenía y Lovable no, hay que devolverla a Lovable y resincronizar (producción no es dueña de ese archivo).
- **No debe haber `✗` pendientes** del informe del sync.
- **Rutas nuevas**: `/how-it-works` y `/email/otp` cargan sin errores de consola.
- **Pantallas tocadas a revisar sí o sí**: `/onboarding` (rediseño completo del carrusel), `/` → selección de idioma (`Language`, rediseño), `/postal-code` (imagen nueva), `/home` (enlace "Com funciona?").
- **QA visual en las 4 resoluciones canónicas** (375×667, 768×1024, 667×375, 1280×550) **en ventana real del navegador, nunca en el modo responsive de DevTools** (§7.5 de la guía: el iframe simulado interpreta `100dvh` y las media queries de otra forma y genera falsos positivos). Comparar contra la misma ruta en el dominio `.lovable.app`.
- **Smoke de idiomas**: `corepack pnpm --filter @km0lab/e2e qa:lang`.

---

## 10. Fase 6 — Commit y PR

Esto es sustancial (2 pantallas nuevas + rediseño de onboarding y selección de idioma): **rama + PR**, no push directo a `develop`.

```bash
git checkout -b feature/sync-lovable-how-it-works-onboarding
# Añadir SOLO rutas explícitas — nunca git add -A (ver §2.2)
git add apps/km0lab/src/pages/HowItWorks.tsx apps/km0lab/src/pages/EmailOtpTemplate.tsx \
        apps/km0lab/src/data/howItWorksSteps.ts apps/km0lab/src/App.tsx \
        scripts/lovable-manifest.json scripts/assets-manifest.json
# …más el resto de archivos que git diff -w --stat marque como cambiados de verdad,
#   más los 12 binarios nuevos de apps/km0lab/src/assets/
git status   # revisar que no se ha colado ruido CRLF
```

Conventional Commits, subject imperativo en minúsculas, **máximo 50 caracteres**, sin punto final. Por ejemplo: `feat(km0lab): porta how-it-works y onboarding`.

El `push` y la apertura del PR **los hace el usuario** (§2.4).

---

## 11. Decisiones ya tomadas (13-sep-2026)

Resueltas con el usuario; no hay que volver a preguntarlas:

1. **Alcance congelado** en el commit `5d786c9` de Lovable. Si aparecen cambios
   posteriores, van a una ronda distinta.
2. **Guard de `/how-it-works`**: `RequireSetup need="location"`. Aplicado.
3. **`/email/otp`**: se porta como preview de diseño, sin guard. Conectarla al
   envío real vía `packages/email/` queda como tarea de backend aparte.
4. **Atajos de prototipo** (bypass de `RequireAuth` en `import.meta.env.DEV` y
   flag `sessionStorage.km0_preview_authed`): se mantienen. No requería acción —
   producción ya los tenía idénticos antes del sync.
5. **Archivos de sesión/auth sueltos**: commiteados aparte en `develop`
   (`83b89c8`), antes del porte.
6. **i18n**: overlay de producción (§4.1).
7. **PR**: uno solo para toda la ronda.

Sigue abierto, por ser trabajo de otro ámbito: conectar al backend real los mocks
que el porte trae (`pointsActions.ts`, `REWARDS`, `COMERCIOS_DETALL`). Si no se
hace ahora, dejarlo escrito como deuda técnica.

---

## 12. Condiciones de parada

Para y pregunta, en vez de improvisar, si:

- El dry-run del sync no sale `0 fallos, 0 errores`.
- `git diff -w` muestra cambios reales en archivos `locked` (`packages/app/services/km0labClient.ts`, `apiClient.ts`, `auth.ts`, `profile.ts`, `stores/useAppStore.ts`, `hooks/useAuth.ts`, `useProfile.ts`, `utils/env.ts`, `data/notifications.ts`, `contexts/LangContext.tsx`): el sync no debería tocarlos nunca.
- El diff de `packages/app/utils/i18n.ts` **borra** claves.
- Una descarga de asset da 404 (host de preview de Lovable caducado).
- Aparece en Lovable algún tipo de archivo sin receta en `PORTING-FROM-LOVABLE.md`. En ese caso, además, hay que actualizar esa guía en el mismo PR (§11 de la guía: es un documento vivo).

---

## Apéndice — Errores concretos de la v1 de este plan

Para que no se repitan:

| Error de la v1                                 | Realidad                                                                                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Lo único que falta es `EmailOtpTemplate.tsx`" | Faltaban además `HowItWorks.tsx` + `howItWorksSteps.ts` y los rediseños de Onboarding/StackCarousel/Language/PostalCode. Causa: análisis sobre un clon 66 commits desactualizado, sin `git fetch` previo |
| "Fusionar a mano las claves i18n"              | El sync sobrescribe `packages/app/utils/i18n.ts` entero. No se toca a mano                                                                                                                               |
| "`types/points.ts` no existe en destino"       | Falsa alarma: mapea a `packages/app/types/points.ts` y sincroniza bien                                                                                                                                   |
| "Ejecutar `pnpm sync:assets`" a secas          | `pnpm` no está en el PATH, el CDN está bloqueado por el proxy, y 4 entradas obsoletas del manifest abortarían el sync con 404                                                                            |
| Nada sobre finales de línea                    | Sin `.gitattributes`, ~112 archivos aparecen como modificados sin serlo; `git add -A` contaminaría el commit                                                                                             |
| "Añadir ruta lazy + `<Route>`"                 | En producción las rutas van envueltas en `RequireSetup`/`RequireAuth`, y el slug correcto del email es `/email/otp`, no el que sugiere el script                                                         |
