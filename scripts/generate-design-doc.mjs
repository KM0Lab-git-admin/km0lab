#!/usr/bin/env node
/**
 * generate-design-doc.mjs
 *
 * Genera `docs/DESIGN-SYSTEM.md`: la documentación visual completa del
 * proyecto, pensada para pegarse como contexto en cualquier IA (Claude,
 * ChatGPT, Lovable, v0…) y obtener propuestas de pantallas coherentes
 * con el design system.
 *
 * Fuente de verdad: `packages/app/design-system/` (espejo del
 * `src/design-system/` del repo de Lovable). El documento NO se edita a
 * mano: se regenera con `pnpm design:doc` cada vez que cambien los
 * tokens o el catálogo de componentes.
 *
 * Implementación: compila el design-system a CommonJS en un directorio
 * temporal con el tsc del monorepo (sin dependencias extra) y ejecuta
 * los generadores.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const OUT_PATH = resolve(REPO_ROOT, 'docs/DESIGN-SYSTEM.md')

const require = createRequire(import.meta.url)
const tscBin = require.resolve('typescript/bin/tsc', {
  paths: [REPO_ROOT],
})

const tmp = mkdtempSync(join(tmpdir(), 'km0lab-design-doc-'))

try {
  execFileSync(
    process.execPath,
    [
      tscBin,
      '--module',
      'commonjs',
      '--target',
      'es2022',
      '--moduleResolution',
      'node',
      '--esModuleInterop',
      '--skipLibCheck',
      '--rootDir',
      resolve(REPO_ROOT, 'packages/app/design-system'),
      '--outDir',
      tmp,
      resolve(REPO_ROOT, 'packages/app/design-system/index.ts'),
    ],
    { stdio: 'inherit' }
  )

  const ds = require(join(tmp, 'index.js'))

  const curated = `
# KM0 LAB — Identidad visual y uso del documento

## A. Identidad visual (lo que los tokens no cuentan)

- **Logo**: wordmark "KM0 LAB©" en azul marca sobre pastilla amarilla o
  fondo blanco. En código SIEMPRE vía el componente \`Km0Logo\`; nunca
  recrearlo con texto.
- **Mascota**: robot KM0 (\`km0-robot.png\`), sonriente, dentro de
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
  \`BrandedFrame\`; la Home y el Chat usan shell propio con
  \`BottomTabs\` / fullbleed.
- Diseño mobile-first: base portrait 375×667. Los otros tres puntos de
  la matriz (768×1024, 667×375 smoke, 1280×550) se derivan de ella.
- Navegación con rutas kebab-case; copy nunca hardcodeado (diccionario
  i18n).

## C. Cómo usar este documento en una IA externa

Pega el documento completo como primer mensaje (o system prompt) y
después pide la pantalla con esta plantilla:

\`\`\`
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
\`\`\`

Para brainstorm rápido pide "descripción por bloques" (barato de
iterar); para validar visualmente pide "maqueta HTML+Tailwind
autocontenida en un solo archivo" (se abre en el navegador sin build);
el código React final solo cuando la propuesta esté decidida, y
generado en Lovable, que ya tiene los componentes reales.
`

  const doc = [
    '<!-- GENERADO por scripts/generate-design-doc.mjs — NO editar a mano.',
    '     Regenerar con: pnpm design:doc -->',
    '',
    ds.generateAIContext(),
    '',
    '---',
    '',
    ds.generateComponentsContext(),
    '',
    '---',
    curated.trim(),
    '',
  ].join('\n')

  const prettierPath = require.resolve('prettier', { paths: [REPO_ROOT] })
  const prettierModule = await import(new URL(`file://${prettierPath}`).href)
  const prettier = prettierModule.default ?? prettierModule
  const prettierConfig = await prettier.resolveConfig(OUT_PATH)
  const formatted = await prettier.format(doc, {
    ...prettierConfig,
    filepath: OUT_PATH,
  })

  writeFileSync(OUT_PATH, formatted)
  console.log(`Generado ${OUT_PATH} (${formatted.length} caracteres)`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
