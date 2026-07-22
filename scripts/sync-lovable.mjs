#!/usr/bin/env node
/**
 * sync-lovable.mjs
 *
 * Sincroniza código (pantallas, componentes, primitivos ui, hooks,
 * services, data y locales) desde el repo de Lovable
 * (`speak-spanish-easily`) hacia este monorepo, aplicando el mapping
 * mecánico de `AGENTS.md` §2 y las reescrituras de imports documentadas
 * en `docs/PORTING-FROM-LOVABLE.md`.
 *
 * Política: Lovable es la "source of truth" visual. El script SOBRESCRIBE
 * el destino con el contenido remoto (transformado). Git es la red de
 * seguridad: revisa el diff antes de commitear. Los binarios NO van por
 * aquí: usa `pnpm sync:assets`.
 *
 * Uso:
 *   pnpm sync:lovable [-- --dry-run] [-- --source <url|dir>]
 *   node scripts/sync-lovable.mjs --dry-run
 *   node scripts/sync-lovable.mjs --source ../lovable   # checkout local
 *
 * Los archivos a sincronizar se declaran en `scripts/lovable-manifest.json`
 * como entradas `{ "from": "src/pages/X.tsx" }` (el destino se deriva del
 * mapping; `"to"` explícito solo para excepciones, p. ej. data compartido
 * que deba ir a packages/app/data).
 *
 * Requiere Node 20+.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')

/* ── Mapping mecánico Lovable → producción (AGENTS.md §2) ─────────── */

const ZONES = {
  app: {
    pkgName: 'km0lab',
    pkgJson: 'apps/km0lab/package.json',
  },
  ui: {
    pkgName: '@km0lab/ui',
    pkgJson: 'packages/components/package.json',
    barrel: 'packages/components/index.ts',
  },
  pkgApp: {
    pkgName: '@km0lab/app',
    pkgJson: 'packages/app/package.json',
  },
}

/* Piezas solo-Lovable: harness de preview, integraciones del entorno
 * Lovable y espejos que ya existen en producción. Excluidas del sync por
 * contrato (docs/LOVABLE-KNOWLEDGE.md, frontera Lovable ↔ producción). */
const NEVER_SYNC = [
  /^src\/integrations\//,
  /^src\/lib\/utils\.ts$/,
  /^src\/design-system\//,
  /^src\/pages\/(PreviewAll|DesignSystem|Components)\.tsx$/,
  /^src\/components\/(DeviceShell|SimulatedDevice)\.tsx$/,
  /^src\/test\//,
  /^supabase\//,
]

const MAPPING = [
  {
    re: /^src\/components\/ui\/(.+)$/,
    to: (m) => `packages/components/ui/${m[1]}`,
    zone: 'ui',
  },
  {
    re: /^src\/pages\/(.+)$/,
    to: (m) => `apps/km0lab/src/pages/${m[1]}`,
    zone: 'app',
  },
  {
    re: /^src\/components\/(.+)$/,
    to: (m) => `apps/km0lab/src/components/${m[1]}`,
    zone: 'app',
  },
  {
    re: /^src\/hooks\/(.+)$/,
    to: (m) => `packages/app/hooks/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/hooks',
  },
  {
    re: /^src\/services\/(.+)$/,
    to: (m) => `packages/app/services/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/services',
  },
  {
    re: /^src\/data\/(.+)$/,
    to: (m) => `apps/km0lab/src/data/${m[1]}`,
    zone: 'app',
  },
  {
    re: /^src\/locales\/(.+)$/,
    to: (m) => `apps/km0lab/src/locales/${m[1]}`,
    zone: 'app',
  },
  {
    re: /^src\/stores\/(.+)$/,
    to: (m) => `packages/app/stores/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/stores',
  },
  {
    re: /^src\/machines\/(.+)$/,
    to: (m) => `packages/app/machines/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/machines',
  },
  {
    re: /^src\/types\/(.+)$/,
    to: (m) => `packages/app/types/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/types',
  },
  {
    re: /^src\/contexts\/(.+)$/,
    to: (m) => `apps/km0lab/src/contexts/${m[1]}`,
    zone: 'app',
  },
  {
    re: /^src\/lib\/(.+)$/,
    to: (m) => `packages/app/utils/${m[1]}`,
    zone: 'pkgApp',
    barrelDir: 'packages/app/utils',
  },
]

/* Variantes responsive que históricamente han faltado en producción y
 * rompen en silencio (PORTING-FROM-LOVABLE.md §7.1). `landscape:` y
 * `portrait:` son core de Tailwind y siempre existen. */
const RISKY_VARIANTS = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'vertical-mobile',
  'vertical-tablet',
  'horizontal-mobile',
  'horizontal-desktop',
  'wide-landscape',
  'short-landscape',
  'tablet-portrait',
]

function mapDestination(entry) {
  if (entry.to) {
    const zone = entry.to.startsWith('packages/components/')
      ? 'ui'
      : entry.to.startsWith('packages/app/')
        ? 'pkgApp'
        : 'app'
    return { to: entry.to, zone, barrelDir: null }
  }
  for (const rule of MAPPING) {
    const m = entry.from.match(rule.re)
    if (m) {
      return { to: rule.to(m), zone: rule.zone, barrelDir: rule.barrelDir }
    }
  }
  return null
}

/* ── Reescritura de imports por zona de destino ───────────────────── */

function rewriteSpecifier(spec, zone, report) {
  if (!spec.startsWith('@/')) return spec

  if (zone === 'app') {
    if (/^@\/components\/ui\//.test(spec)) return '@km0lab/ui'
    if (/^@\/(hooks|services|stores|machines|types)\//.test(spec)) {
      return '@km0lab/app'
    }
    if (spec !== '@/lib/utils' && /^@\/lib\//.test(spec)) return '@km0lab/app'
    return spec // @/components, @/contexts, @/assets, @/data, @/lib/utils
  }

  if (zone === 'ui') {
    if (spec === '@/lib/utils') return '../lib/utils'
    const ui = spec.match(/^@\/components\/ui\/(.+)$/)
    if (ui) return `./${ui[1]}`
    report.errors.push(
      `import no portable en primitivo ui: "${spec}" — un primitivo de ` +
        `@km0lab/ui no puede depender de código de la app; resuélvelo a mano`
    )
    return spec
  }

  // zone === 'pkgApp' (hooks, services, stores, machines, types, utils)
  const lib = spec.match(/^@\/lib\/(?!utils$)(.+)$/)
  if (lib) return `../utils/${lib[1]}`
  const inner = spec.match(
    /^@\/(hooks|services|data|stores|machines|types)\/(.+)$/
  )
  if (inner) {
    if (inner[1] === 'data') {
      report.warnings.push(
        `import "${spec}" reescrito a ../data — asegúrate de sincronizar ` +
          `ese archivo a packages/app/data con un "to" explícito en el manifest`
      )
    }
    return `../${inner[1]}/${inner[2]}`
  }
  report.errors.push(
    `import no portable en packages/app: "${spec}" — la lógica compartida ` +
      `no puede depender de componentes/assets de la app; resuélvelo a mano`
  )
  return spec
}

function rewriteImports(content, zone, report) {
  return content.replace(/(['"])(@\/[^'"]+)\1/g, (full, quote, spec) => {
    const next = rewriteSpecifier(spec, zone, report)
    if (next !== spec) report.rewrites.push(`${spec} → ${next}`)
    return `${quote}${next}${quote}`
  })
}

/* ── Verificaciones ───────────────────────────────────────────────── */

function collectBareImports(content) {
  const specs = new Set()
  const re =
    /(?:import|export)[^'"]*?from\s*(['"])([^'"]+)\1|import\s*(['"])([^'"]+)\3/g
  for (const m of content.matchAll(re)) {
    const spec = m[2] ?? m[4]
    if (!spec) continue
    if (spec.startsWith('.') || spec.startsWith('@/')) continue
    if (spec.startsWith('node:')) continue
    const pkg = spec.startsWith('@')
      ? spec.split('/').slice(0, 2).join('/')
      : spec.split('/')[0]
    specs.add(pkg)
  }
  return [...specs]
}

async function checkDependencies(content, zone, report, pkgJsonCache) {
  const { pkgName, pkgJson } = ZONES[zone]
  if (!pkgJsonCache.has(pkgJson)) {
    const raw = await readFile(resolve(REPO_ROOT, pkgJson), 'utf8')
    const json = JSON.parse(raw)
    pkgJsonCache.set(
      pkgJson,
      new Set([
        ...Object.keys(json.dependencies ?? {}),
        ...Object.keys(json.devDependencies ?? {}),
        ...Object.keys(json.peerDependencies ?? {}),
      ])
    )
  }
  const declared = pkgJsonCache.get(pkgJson)
  for (const pkg of collectBareImports(content)) {
    if (!declared.has(pkg)) {
      report.errors.push(
        `dependencia "${pkg}" no declarada en ${pkgJson} — ` +
          `añádela con: pnpm --filter ${pkgName} add ${pkg}`
      )
    }
  }
}

async function checkBreakpoints(content, report, tailwindCache) {
  if (!tailwindCache.value) {
    tailwindCache.value = await readFile(
      resolve(REPO_ROOT, 'apps/km0lab/tailwind.config.js'),
      'utf8'
    )
  }
  const config = tailwindCache.value
  for (const name of RISKY_VARIANTS) {
    const used = new RegExp(`(?<![\\w-])${name}:`).test(content)
    if (!used) continue
    const defined =
      config.includes(`addVariant('${name}'`) ||
      config.includes(`addVariant("${name}"`) ||
      // Prettier puede envolver addVariant(\n  'name', ...) en varias líneas,
      // así que basta con que el nombre entrecomillado aparezca en el config
      // (los nombres de variante son suficientemente distintivos).
      config.includes(`'${name}'`) ||
      config.includes(`"${name}"`) ||
      new RegExp(`(?<![\\w-])['"]?${name}['"]?\\s*:\\s*['"]`).test(config)
    if (!defined) {
      report.errors.push(
        `usa la variante "${name}:" pero no está definida en ` +
          `apps/km0lab/tailwind.config.js — añádela antes de portar ` +
          `(ver PORTING-FROM-LOVABLE.md §7.1)`
      )
    }
  }
}

/* ── Barrels ──────────────────────────────────────────────────────── */

async function ensureBarrelExport(barrelPath, exportLine, dryRun, report) {
  const abs = resolve(REPO_ROOT, barrelPath)
  const content = await readFile(abs, 'utf8')
  if (content.includes(exportLine)) return
  if (dryRun) {
    report.manual.push(`(dry-run) se añadiría "${exportLine}" a ${barrelPath}`)
    return
  }
  let next = content.replace(/^export \{\}\n?/m, '')
  next = `${next.trimEnd()}\n${exportLine}\n`
  await writeFile(abs, next)
  report.rewrites.push(`barrel ${barrelPath}: + ${exportLine}`)
}

async function updateBarrels(dest, dryRun, report) {
  const file = basename(dest.to).replace(/\.(tsx|ts)$/, '')
  if (dest.zone === 'ui') {
    await ensureBarrelExport(
      ZONES.ui.barrel,
      `export * from './ui/${file}'`,
      dryRun,
      report
    )
  } else if (dest.barrelDir) {
    await ensureBarrelExport(
      `${dest.barrelDir}/index.ts`,
      `export * from './${file}'`,
      dryRun,
      report
    )
  }
}

/* ── Main ─────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const args = { dryRun: false, source: null, manifest: null }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dry-run') args.dryRun = true
    else if (argv[i] === '--source') args.source = argv[(i += 1)]
    else if (argv[i] === '--manifest') args.manifest = argv[(i += 1)]
  }
  return args
}

async function readSource(source, from) {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(`${source.replace(/\/+$/, '')}/${from}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  return readFile(resolve(REPO_ROOT, source, from), 'utf8')
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const manifestPath = args.manifest
    ? resolve(REPO_ROOT, args.manifest)
    : resolve(SCRIPT_DIR, 'lovable-manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const source = args.source ?? manifest.source
  const files = manifest.files ?? []
  const locked = manifest.locked ?? []

  const isLocked = (to) =>
    locked.some((l) => to === l || to.startsWith(l.endsWith('/') ? l : `${l}/`))

  if (files.length === 0) {
    console.log(
      'Manifest sin archivos. Añade entradas {"from": "src/pages/X.tsx"} ' +
        'a scripts/lovable-manifest.json y vuelve a ejecutar.'
    )
    return
  }

  console.log(`Sincronizando ${files.length} archivos desde:`)
  console.log(
    `  ${source}${args.dryRun ? '  (dry-run: no se escribe nada)' : ''}\n`
  )

  const pkgJsonCache = new Map()
  const tailwindCache = { value: null }
  const summary = { ok: 0, fail: 0, errors: 0 }
  const newPages = []

  for (const entry of files) {
    if (NEVER_SYNC.some((re) => re.test(entry.from))) {
      console.log(`  · ${entry.from} ... EXCLUIDO`)
      console.error(
        '    pieza solo-Lovable (harness de preview, integración del ' +
          'entorno o espejo ya existente): excluida del sync por contrato ' +
          '(docs/LOVABLE-KNOWLEDGE.md)'
      )
      summary.fail += 1
      continue
    }
    const dest = mapDestination(entry)
    if (dest && isLocked(dest.to)) {
      console.log(`  · ${entry.from} ... BLOQUEADO`)
      console.error(
        `    destino ${dest.to} está en "locked" del manifest: producción ` +
          'es propietaria de ese archivo (implementación real). Quitar el ' +
          'candado es una decisión humana explícita.'
      )
      summary.fail += 1
      continue
    }
    if (!dest) {
      console.log(`  · ${entry.from} ... SIN MAPPING`)
      console.error(
        '    ruta fuera del contrato de sync: añade "to" explícito o ' +
          'revisa la estructura (docs/LOVABLE-KNOWLEDGE.md §1)'
      )
      summary.fail += 1
      continue
    }

    const report = { rewrites: [], warnings: [], errors: [], manual: [] }
    process.stdout.write(`  · ${dest.to}  ←  ${entry.from} ... `)

    try {
      let content = await readSource(source, entry.from)
      const isCode = /\.(tsx|ts|jsx|js)$/.test(entry.from)

      if (isCode) {
        content = rewriteImports(content, dest.zone, report)
        await checkDependencies(content, dest.zone, report, pkgJsonCache)
        await checkBreakpoints(content, report, tailwindCache)
      }

      const destAbs = resolve(REPO_ROOT, dest.to)
      const isNew = !(await exists(destAbs))
      if (isNew && /^apps\/km0lab\/src\/pages\//.test(dest.to)) {
        newPages.push(basename(dest.to, '.tsx'))
      }

      if (!args.dryRun) {
        await mkdir(dirname(destAbs), { recursive: true })
        await writeFile(destAbs, content)
      }
      if (isCode) await updateBarrels(dest, args.dryRun, report)

      console.log(report.errors.length > 0 ? 'ESCRITO CON ERRORES' : 'OK')
      for (const line of report.rewrites) console.log(`      ↻ ${line}`)
      for (const line of report.warnings) console.log(`      ⚠ ${line}`)
      for (const line of report.errors) console.error(`      ✗ ${line}`)
      for (const line of report.manual) console.log(`      … ${line}`)
      summary.ok += 1
      summary.errors += report.errors.length
    } catch (err) {
      console.log('FAIL')
      console.error(`    ${err.message}`)
      summary.fail += 1
    }
  }

  console.log(
    `\nResumen: ${summary.ok} sincronizados, ${summary.fail} con fallo, ` +
      `${summary.errors} errores a resolver.`
  )

  console.log('\nPasos manuales pendientes:')
  for (const page of newPages) {
    const path = page.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    console.log(
      `  - Añadir ruta en apps/km0lab/src/App.tsx: ` +
        `const ${page} = lazy(() => import('./pages/${page}')) y ` +
        `<Route path="/${path}" element={<${page} />} />`
    )
  }
  console.log('  - Assets binarios nuevos: manifest + pnpm sync:assets.')
  console.log('  - pnpm lint:fix (fusiona imports duplicados de @km0lab/*).')
  console.log('  - pnpm validate y QA visual en las 4 resoluciones canónicas.')

  if (summary.fail > 0 || summary.errors > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
