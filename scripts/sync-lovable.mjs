#!/usr/bin/env node
/**
 * sync-lovable.mjs — porte Lovable → producción POR REGLA.
 *
 * Qué viaja se decide siguiendo los imports, no con una lista a mano:
 *
 *  1. Raíces: todas las pantallas de `src/pages` de Lovable (menos las
 *     excluidas por contrato y las que tienen candado) y `src/lib/i18n.ts`.
 *  2. Desde ahí se siguen los imports `@/…` y relativos. Cada fichero
 *     alcanzado se clasifica:
 *       · visual (componentes, primitivos ui, tipos, máquinas, datos de
 *         presentación, imágenes) → VIAJA y se sobrescribe en producción;
 *       · lógica pura sin datos de ejemplo (hooks de interfaz, helpers) →
 *         VIAJA, salvo que su destino tenga candado;
 *       · COSTURA: hook / service / store / helper que se apoya en datos de
 *         ejemplo (`@/data`, `services/mock`, `stores/useMock*`) → NO viaja.
 *         Producción debe tener su propia versión con el mismo nombre; si
 *         falta, el script lo dice con el nombre exacto.
 *  3. Los destinos en `locked` del manifest son de producción: nunca se
 *     sobrescriben ni se siguen.
 *
 * Además: descarga las imágenes que Lovable guarda como puntero
 * `*.asset.json`, compara las variables CSS del sistema de diseño, formatea
 * lo escrito, avisa de ficheros huérfanos y guarda un estado
 * (`scripts/lovable-sync-state.json`) para detectar en el siguiente porte
 * los ficheros visuales editados a mano en producción.
 *
 * Uso:
 *   pnpm sync:lovable -- --dry-run                 # informe, no escribe
 *   pnpm sync:lovable                              # porte real
 *   pnpm sync:lovable -- --source ../km0lab-lovable  # checkout local
 *   pnpm sync:lovable -- --prune                   # borra huérfanos
 *   pnpm sync:check                                # ensayo completo en copia
 *
 * Contrato completo: docs/PORTING-FROM-LOVABLE.md §12. Requiere Node 20+.
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const STATE_FILE = 'scripts/lovable-sync-state.json'

/* ── Mapping mecánico Lovable → producción (AGENTS.md §2) ─────────── */

const ZONES = {
  app: { pkgName: 'km0lab', pkgJson: 'apps/km0lab/package.json' },
  ui: {
    pkgName: '@km0lab/ui',
    pkgJson: 'packages/components/package.json',
    barrel: 'packages/components/index.ts',
  },
  pkgApp: { pkgName: '@km0lab/app', pkgJson: 'packages/app/package.json' },
}

/* Piezas solo-Lovable: harness de preview e integraciones de su entorno. */
const NEVER_SYNC = [
  /^src\/integrations\//,
  /^src\/design-system\//,
  /^src\/pages\/(PreviewAll|DesignSystem|Components)\.tsx$/,
  /^src\/components\/SimulatedDevice\.tsx$/,
  /^src\/test\//,
  /^supabase\//,
  /\.test\.(ts|tsx)$/,
]

const MAPPING = [
  [/^src\/components\/ui\/(.+)$/, 'packages/components/ui/', 'ui', null],
  [/^src\/pages\/(.+)$/, 'apps/km0lab/src/pages/', 'app', null],
  [/^src\/components\/(.+)$/, 'apps/km0lab/src/components/', 'app', null],
  [/^src\/data\/(.+)$/, 'apps/km0lab/src/data/', 'app', null],
  [/^src\/contexts\/(.+)$/, 'apps/km0lab/src/contexts/', 'app', null],
  [/^src\/assets\/(.+)$/, 'apps/km0lab/src/assets/', 'app', null],
  [/^src\/hooks\/(.+)$/, 'packages/app/hooks/', 'pkgApp', 'hooks'],
  [/^src\/services\/(.+)$/, 'packages/app/services/', 'pkgApp', 'services'],
  [/^src\/stores\/(.+)$/, 'packages/app/stores/', 'pkgApp', 'stores'],
  [/^src\/machines\/(.+)$/, 'packages/app/machines/', 'pkgApp', 'machines'],
  [/^src\/types\/(.+)$/, 'packages/app/types/', 'pkgApp', 'types'],
  [/^src\/lib\/(.+)$/, 'packages/app/utils/', 'pkgApp', 'utils'],
]

/** Carpetas cuya lógica puede ser una costura (no viaja si usa ejemplos). */
const SEAM_KINDS = /^src\/(hooks|services|stores|lib)\//
/** Fuentes de datos de ejemplo: quien las importa es una costura. */
const MOCK_SOURCE =
  /^src\/(data\/|services\/mock\/|stores\/useMock|types\/mock)/

/** Carpetas de producción gestionadas enteras por el porte (huérfanos). */
const MANAGED_DIRS = [
  'apps/km0lab/src/pages',
  'apps/km0lab/src/components',
  'apps/km0lab/src/data',
]

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

const LOVABLE_SETUP_STORAGE =
  /localStorage\.(?:get|set|remove)Item\(\s*['"]km0_(?:postal_code|town)['"]/

const CODE_EXT = /\.(tsx|ts|jsx|js)$/
const RESOLVE_EXTS = ['', '.ts', '.tsx', '.json', '/index.ts', '/index.tsx']

/* ── Utilidades ───────────────────────────────────────────────────── */

const toPosix = (p) => p.split('\\').join('/')
const sha = (buf) =>
  createHash('sha256')
    .update(
      typeof buf === 'string' ? buf.replace(/\r\n/g, '\n') : buf,
      typeof buf === 'string' ? 'utf8' : undefined
    )
    .digest('hex')

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function mapDestination(from) {
  for (const [re, prefix, zone, barrel] of MAPPING) {
    const m = from.match(re)
    if (m) return { to: prefix + m[1], zone, barrel }
  }
  return null
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    source: null,
    manifest: null,
    prune: false,
    fix: true,
    refreshAssets: false,
    force: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--source') args.source = argv[(i += 1)]
    else if (a === '--manifest') args.manifest = argv[(i += 1)]
    else if (a === '--prune') args.prune = true
    else if (a === '--no-fix') args.fix = false
    else if (a === '--refresh-assets') args.refreshAssets = true
    else if (a === '--force') args.force = true
  }
  return args
}

/* ── Fuente: checkout local o clon superficial del remoto ─────────── */

async function resolveSource(source) {
  if (!/^https?:\/\//.test(source)) {
    const dir = resolve(REPO_ROOT, source)
    if (!existsSync(join(dir, 'src'))) {
      throw new Error(`la fuente ${dir} no parece un proyecto de Lovable`)
    }
    return { dir, commit: gitHead(dir), cleanup: async () => {} }
  }
  // https://raw.githubusercontent.com/<owner>/<repo>/<branch>  o  URL .git
  const raw = source.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/?$/
  )
  const gitUrl = raw ? `https://github.com/${raw[1]}/${raw[2]}.git` : source
  const branch = raw ? raw[3] : 'main'
  const dir = await mkdtemp(join(os.tmpdir(), 'km0lab-lovable-'))
  execFileSync(
    'git',
    ['clone', '--quiet', '--depth', '1', '--branch', branch, gitUrl, dir],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  )
  return {
    dir,
    commit: gitHead(dir),
    cleanup: () => rm(dir, { recursive: true, force: true }),
  }
}

function gitHead(dir) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%h %cI'], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'sin git'
  }
}

/* ── Imports ──────────────────────────────────────────────────────── */

/** Devuelve [{ spec, names }] de un fichero de código. */
function parseImports(content) {
  const found = []
  const re =
    /(?:import|export)\s+(type\s+)?([^'";]*?)\s*from\s*(['"])([^'"]+)\3|import\s*(['"])([^'"]+)\5|import\(\s*(['"])([^'"]+)\7\s*\)/g
  for (const m of content.matchAll(re)) {
    const spec = m[4] ?? m[6] ?? m[8]
    if (!spec) continue
    const names = []
    const clause = m[2] ?? ''
    const braces = clause.match(/\{([^}]*)\}/)
    if (braces) {
      for (const part of braces[1].split(',')) {
        const name = part
          .replace(/\btype\s+/, '')
          .trim()
          .split(/\s+as\s+/)[0]
          .trim()
        if (name) names.push(name)
      }
    }
    found.push({ spec, names })
  }
  return found
}

function resolveInLovable(srcDir, fromFile, spec) {
  let base
  if (spec.startsWith('@/')) base = `src/${spec.slice(2)}`
  else if (spec.startsWith('.')) {
    base = toPosix(join(dirname(fromFile), spec))
  } else return null
  for (const ext of RESOLVE_EXTS) {
    const candidate = base + ext
    const abs = join(srcDir, candidate)
    if (existsSync(abs) && statSync(abs).isFile()) return candidate
  }
  return undefined // import interno que no existe en Lovable
}

/* ── Reescritura de imports por zona de destino ───────────────────── */

/**
 * Tras reescribir `@/…` a `@km0lab/app` o `@km0lab/ui`, un fichero queda
 * con varios imports del mismo paquete. Se fusionan aquí (uno de valores y
 * uno de tipos por paquete) para no depender del autofix de ESLint, que
 * rompe los imports de varias líneas.
 */
function mergeDuplicateImports(content) {
  const re =
    /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+(['"])([^'"]+)\3;?[ \t]*\r?\n/gm
  const groups = new Map()
  for (const m of content.matchAll(re)) {
    const key = `${m[1] ? 'type' : 'value'}|${m[4]}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(m)
  }
  let next = content
  for (const [key, matches] of groups) {
    if (matches.length < 2) continue
    const [kind, source] = key.split('|')
    const names = []
    for (const m of matches) {
      for (const part of m[2].split(',')) {
        const name = part.trim()
        if (name && !names.includes(name)) names.push(name)
      }
    }
    const merged = `import ${kind === 'type' ? 'type ' : ''}{ ${names.join(', ')} } from '${source}'\n`
    matches.forEach((m, i) => {
      next = next.replace(m[0], i === 0 ? merged : '')
    })
  }
  return next
}

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
        `@km0lab/ui no puede depender de código de la app`
    )
    return spec
  }

  // zone === 'pkgApp' (hooks, services, stores, machines, types, utils)
  // El diccionario se importa siempre por el overlay de producción, que
  // añade las claves propias (`TKey` = Lovable + producción).
  if (spec === '@/lib/i18n') return '../utils/i18nProd'
  const lib = spec.match(/^@\/lib\/(?!utils$)(.+)$/)
  if (lib) return `../utils/${lib[1]}`
  const inner = spec.match(/^@\/(hooks|services|stores|machines|types)\/(.+)$/)
  if (inner) return `../${inner[1]}/${inner[2]}`
  report.errors.push(
    `import no portable en packages/app: "${spec}" — la lógica compartida ` +
      `no puede depender de componentes, contextos ni datos de la app`
  )
  return spec
}

function rewriteImports(content, zone, report) {
  return content.replace(/(['"])(@\/[^'"]+)\1/g, (full, quote, spec) => {
    const next = rewriteSpecifier(spec, zone, report)
    return `${quote}${next}${quote}`
  })
}

/* ── Comprobaciones por fichero ───────────────────────────────────── */

function bareImports(content) {
  const specs = new Set()
  for (const { spec } of parseImports(content)) {
    if (spec.startsWith('.') || spec.startsWith('@/')) continue
    if (spec.startsWith('node:')) continue
    specs.add(
      spec.startsWith('@')
        ? spec.split('/').slice(0, 2).join('/')
        : spec.split('/')[0]
    )
  }
  return [...specs]
}

const pkgJsonCache = new Map()
function declaredDeps(zone) {
  const { pkgJson } = ZONES[zone]
  if (!pkgJsonCache.has(pkgJson)) {
    const json = JSON.parse(readFileSync(resolve(REPO_ROOT, pkgJson), 'utf8'))
    pkgJsonCache.set(
      pkgJson,
      new Set([
        ...Object.keys(json.dependencies ?? {}),
        ...Object.keys(json.devDependencies ?? {}),
        ...Object.keys(json.peerDependencies ?? {}),
      ])
    )
  }
  return pkgJsonCache.get(pkgJson)
}

function checkDependencies(content, zone, report) {
  const declared = declaredDeps(zone)
  for (const pkg of bareImports(content)) {
    if (!declared.has(pkg)) {
      report.errors.push(
        `dependencia "${pkg}" no declarada en ${ZONES[zone].pkgJson} — ` +
          `pnpm --filter ${ZONES[zone].pkgName} add ${pkg}`
      )
    }
  }
}

let tailwindConfig = null
function checkBreakpoints(content, report) {
  tailwindConfig ??= readFileSync(
    resolve(REPO_ROOT, 'apps/km0lab/tailwind.config.js'),
    'utf8'
  )
  for (const name of RISKY_VARIANTS) {
    if (!new RegExp(`(?<![\\w-])${name}:`).test(content)) continue
    const defined =
      tailwindConfig.includes(`'${name}'`) ||
      tailwindConfig.includes(`"${name}"`) ||
      new RegExp(`(?<![\\w-])['"]?${name}['"]?\\s*:\\s*['"]`).test(
        tailwindConfig
      )
    if (!defined) {
      report.errors.push(
        `usa la variante "${name}:" que no existe en ` +
          `apps/km0lab/tailwind.config.js (PORTING-FROM-LOVABLE.md §7.1)`
      )
    }
  }
}

/* ── Nombres que exporta @km0lab/app (para comprobar costuras) ────── */

function productionExports() {
  const names = new Set()
  const files = walk(resolve(REPO_ROOT, 'packages/app')).filter((f) =>
    CODE_EXT.test(f)
  )
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(
      /export\s+(?:default\s+)?(?:async\s+)?(?:const|let|function|class|type|interface|enum)\s+([A-Za-z0-9_$]+)/g
    )) {
      names.add(m[1])
    }
    for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
      for (const part of m[1].split(',')) {
        const name = part
          .replace(/\btype\s+/, '')
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim()
        if (name) names.add(name)
      }
    }
  }
  return names
}

/* ── Variables CSS del sistema de diseño ──────────────────────────── */

function cssVariables(file) {
  if (!existsSync(file)) return new Map()
  const vars = new Map()
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
    if (!vars.has(m[1])) vars.set(m[1], m[2].trim())
  }
  return vars
}

function checkDesignTokens(sourceDir) {
  const lovable = cssVariables(join(sourceDir, 'src/index.css'))
  const production = new Map([
    ...cssVariables(resolve(REPO_ROOT, 'apps/km0lab/src/styles/global.css')),
    ...cssVariables(
      resolve(REPO_ROOT, 'packages/km0lab-web-theme/src/globals.css')
    ),
  ])
  const missing = []
  for (const [name, value] of lovable) {
    if (!production.has(name)) missing.push(`${name}: ${value};`)
  }
  return missing
}

/* ── Barrels ──────────────────────────────────────────────────────── */

async function ensureBarrelExport(barrelPath, exportLine, dryRun, summary) {
  const abs = resolve(REPO_ROOT, barrelPath)
  if (!existsSync(abs)) return
  const content = await readFile(abs, 'utf8')
  if (content.includes(exportLine)) return
  summary.barrels.push(`${barrelPath}: + ${exportLine}`)
  if (dryRun) return
  const next = content.replace(/^export \{\}\n?/m, '').trimEnd()
  await writeFile(abs, `${next}\n${exportLine}\n`)
}

/* ── Main ─────────────────────────────────────────────────────────── */

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const manifestPath = args.manifest
    ? resolve(REPO_ROOT, args.manifest)
    : resolve(SCRIPT_DIR, 'lovable-manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const locked = manifest.locked ?? []
  const isLocked = (to) =>
    locked.some((l) => to === l || to.startsWith(l.endsWith('/') ? l : `${l}/`))
  const never = (from) => NEVER_SYNC.some((re) => re.test(from))

  const source = await resolveSource(args.source ?? manifest.source)
  const SRC = source.dir
  console.log(`Porte desde Lovable (${source.commit})`)
  console.log(
    `  ${SRC}${args.dryRun ? '  [dry-run: no se escribe nada]' : ''}\n`
  )

  const summary = {
    written: [],
    unchanged: 0,
    assets: [],
    barrels: [],
    seamsOk: new Set(),
    errors: [],
    warnings: [],
    orphans: [],
    editedInProduction: [],
  }
  const fail = (msg) => {
    if (!summary.errors.includes(msg)) summary.errors.push(msg)
  }

  /* 1. Recorrido por imports ─────────────────────────────────────── */

  const lovFiles = new Set(
    walk(join(SRC, 'src')).map((f) => toPosix(f).slice(toPosix(SRC).length + 1))
  )
  const contentCache = new Map()
  const read = (from) => {
    if (!contentCache.has(from)) {
      contentCache.set(from, readFileSync(join(SRC, from), 'utf8'))
    }
    return contentCache.get(from)
  }

  /** ¿Se apoya este fichero de lógica en datos de ejemplo? (transitivo) */
  const mockMemo = new Map()
  const isMockBacked = (from, trail = new Set()) => {
    if (MOCK_SOURCE.test(from)) return true
    if (!SEAM_KINDS.test(from) || !CODE_EXT.test(from)) return false
    if (mockMemo.has(from)) return mockMemo.get(from)
    if (trail.has(from)) return false
    trail.add(from)
    let mock = false
    for (const { spec } of parseImports(read(from))) {
      const target = resolveInLovable(SRC, from, spec)
      if (!target) continue
      if (MOCK_SOURCE.test(target) || isMockBacked(target, trail)) {
        mock = true
        break
      }
    }
    mockMemo.set(from, mock)
    return mock
  }

  const prodExports = productionExports()
  const travel = new Map() // from -> { to, zone, barrel }
  const queue = []
  const enqueue = (from) => {
    if (travel.has(from) || never(from)) return
    const dest = mapDestination(from)
    if (!dest) return
    if (isLocked(dest.to)) return
    travel.set(from, dest)
    queue.push(from)
  }

  for (const from of lovFiles) {
    if (/^src\/pages\/[^/]+\.tsx$/.test(from)) enqueue(from)
  }
  enqueue('src/lib/i18n.ts')
  // El fichero de rutas de Lovable no viaja (el de producción tiene
  // candado), pero lo que monta alrededor de las pantallas sí.
  const ENTRY = 'src/App.tsx'
  if (lovFiles.has(ENTRY)) queue.push(ENTRY)

  while (queue.length > 0) {
    const from = queue.shift()
    if (!CODE_EXT.test(from)) continue
    const importer = travel.get(from) ?? { zone: 'app' }
    for (const { spec, names } of parseImports(read(from))) {
      if (spec === '@/lib/utils') continue // espejo propio en cada zona
      const target = resolveInLovable(SRC, from, spec)
      if (target === null) continue // paquete npm
      if (target === undefined) {
        fail(`${from}: import "${spec}" no existe en Lovable`)
        continue
      }
      const dest = mapDestination(target)
      if (!dest) {
        fail(`${from}: import "${spec}" fuera del contrato de carpetas`)
        continue
      }
      if (never(target)) {
        if (from !== ENTRY && !existsSync(resolve(REPO_ROOT, dest.to))) {
          fail(
            `${from}: importa "${spec}", pieza solo-Lovable sin espejo en ` +
              `producción (${dest.to})`
          )
        }
        continue
      }
      if (isLocked(dest.to)) {
        if (!existsSync(resolve(REPO_ROOT, dest.to))) {
          fail(`${dest.to} tiene candado pero no existe en producción`)
        }
        continue
      }
      // Imagen guardada como puntero al almacén de Lovable.
      if (target.endsWith('.asset.json')) {
        summary.assets.push({ from: target, pointer: true })
        continue
      }
      if (/^src\/assets\//.test(target)) {
        summary.assets.push({ from: target, pointer: false })
        continue
      }
      // Costura: lógica apoyada en datos de ejemplo. No viaja.
      if (SEAM_KINDS.test(target) && isMockBacked(target)) {
        if (importer.zone === 'app') {
          for (const name of names) {
            if (prodExports.has(name)) summary.seamsOk.add(name)
            else {
              fail(
                `costura sin versión real: "${name}" (de ${target}) lo pide ` +
                  `${from} y @km0lab/app no lo exporta`
              )
            }
          }
        } else if (!existsSync(resolve(REPO_ROOT, dest.to))) {
          fail(
            `costura sin versión real: ${from} importa ${target} y falta ` +
              `${dest.to} en producción`
          )
        } else {
          for (const name of names) summary.seamsOk.add(name)
        }
        continue
      }
      if (/^src\/data\//.test(target) && importer.zone !== 'app') {
        fail(`${from}: lógica compartida que importa datos de la app (${spec})`)
        continue
      }
      enqueue(target)
    }
  }

  /* 2. Ficheros editados a mano en producción desde el último porte ─ */

  const statePath = resolve(REPO_ROOT, STATE_FILE)
  const state = existsSync(statePath)
    ? JSON.parse(await readFile(statePath, 'utf8'))
    : null
  if (state) {
    for (const [to, entry] of Object.entries(state.files ?? {})) {
      const abs = resolve(REPO_ROOT, to)
      if (!existsSync(abs)) continue
      if (sha(readFileSync(abs, 'utf8')) !== entry.final) {
        summary.editedInProduction.push(to)
      }
    }
    if (summary.editedInProduction.length > 0 && !args.force) {
      for (const to of summary.editedInProduction) {
        fail(
          `${to} se ha editado en producción desde el último porte: el ` +
            `cambio se perdería. Llévalo a Lovable o a una costura con ` +
            `candado (o usa --force si es intencionado)`
        )
      }
    }
  }

  /* 3. Escritura ─────────────────────────────────────────────────── */

  let prettier = null
  let prettierConfig = null
  try {
    prettier = await import('prettier')
    prettierConfig = await prettier.resolveConfig(
      resolve(REPO_ROOT, 'package.json')
    )
  } catch {
    summary.warnings.push('prettier no disponible: se escribe sin formatear')
  }

  const writtenDests = new Set()
  // Hash del contenido tal como lo genera el porte (antes de lint:fix).
  const generated = new Map()
  for (const [from, dest] of [...travel].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const report = { errors: [] }
    let content = read(from)
    if (CODE_EXT.test(from)) {
      content = mergeDuplicateImports(
        rewriteImports(content, dest.zone, report)
      )
      checkDependencies(content, dest.zone, report)
      checkBreakpoints(content, report)
      if (LOVABLE_SETUP_STORAGE.test(content)) {
        report.errors.push(
          'lee o escribe km0_postal_code / km0_town en localStorage: en ' +
            'producción la ubicación vive en el store (PORTING §12.5)'
        )
      }
    }
    for (const e of report.errors) fail(`${from}: ${e}`)
    if (prettier) {
      try {
        content = await prettier.format(content, {
          ...prettierConfig,
          filepath: resolve(REPO_ROOT, dest.to),
        })
      } catch (err) {
        fail(`${from}: no se pudo formatear (${err.message.split('\n')[0]})`)
      }
    }
    const abs = resolve(REPO_ROOT, dest.to)
    writtenDests.add(dest.to)
    const previous = existsSync(abs) ? readFileSync(abs, 'utf8') : null
    generated.set(dest.to, sha(content))
    const sameAsLastPort =
      previous !== null &&
      state?.files?.[dest.to]?.generated === sha(content) &&
      state.files[dest.to].final === sha(previous)
    if (
      previous !== null &&
      (sameAsLastPort || sha(previous) === sha(content))
    ) {
      summary.unchanged += 1
    } else {
      summary.written.push(
        `${previous === null ? 'NUEVO ' : 'cambia'} ${dest.to}`
      )
      if (!args.dryRun) {
        await mkdir(dirname(abs), { recursive: true })
        await writeFile(abs, content)
      }
    }
    if (CODE_EXT.test(from)) {
      const file = basename(dest.to).replace(/\.(tsx|ts)$/, '')
      if (dest.zone === 'ui') {
        await ensureBarrelExport(
          ZONES.ui.barrel,
          `export * from './ui/${file}'`,
          args.dryRun,
          summary
        )
      } else if (dest.barrel) {
        await ensureBarrelExport(
          `packages/app/${dest.barrel}/index.ts`,
          `export * from './${file}'`,
          args.dryRun,
          summary
        )
      }
    }
  }

  /* 4. Imágenes ──────────────────────────────────────────────────── */

  const assetHost = (manifest.assetHost ?? '').replace(/\/+$/, '')
  const seenAssets = new Set()
  const assetReport = []
  for (const asset of summary.assets) {
    if (seenAssets.has(asset.from)) continue
    seenAssets.add(asset.from)
    const binaryFrom = asset.pointer
      ? asset.from.slice(0, -'.asset.json'.length)
      : asset.from
    const to = mapDestination(binaryFrom).to
    const abs = resolve(REPO_ROOT, to)
    if (existsSync(abs) && !args.refreshAssets) {
      if (!asset.pointer) {
        const local = readFileSync(abs)
        const remote = readFileSync(join(SRC, asset.from))
        if (sha(local) === sha(remote)) continue
      } else continue
    }
    try {
      let bytes
      if (asset.pointer) {
        const pointer = JSON.parse(read(asset.from))
        if (!assetHost) throw new Error('falta "assetHost" en el manifest')
        const url = /^https?:\/\//.test(pointer.url)
          ? pointer.url
          : `${assetHost}${pointer.url}`
        if (args.dryRun) {
          assetReport.push(`se descargaría ${to}`)
          continue
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`)
        bytes = Buffer.from(await res.arrayBuffer())
      } else {
        bytes = readFileSync(join(SRC, asset.from))
        if (args.dryRun) {
          assetReport.push(`se copiaría ${to}`)
          continue
        }
      }
      await mkdir(dirname(abs), { recursive: true })
      await writeFile(abs, bytes)
      assetReport.push(`${to} (${bytes.length} bytes)`)
    } catch (err) {
      fail(`imagen ${asset.from}: ${err.message}`)
    }
  }

  /* 5. Variables CSS, huérfanos ──────────────────────────────────── */

  const missingTokens = checkDesignTokens(SRC)
  for (const token of missingTokens) {
    fail(
      `variable de estilo de Lovable que falta en producción: ${token} ` +
        `(añádela a apps/km0lab/src/styles/global.css)`
    )
  }

  for (const dir of MANAGED_DIRS) {
    for (const abs of walk(resolve(REPO_ROOT, dir))) {
      const to = toPosix(abs).slice(toPosix(REPO_ROOT).length + 1)
      if (writtenDests.has(to) || isLocked(to)) continue
      summary.orphans.push(to)
    }
  }
  if (args.prune && !args.dryRun) {
    for (const to of summary.orphans) await rm(resolve(REPO_ROOT, to))
  }

  /* 6. Formato de imports y estado ───────────────────────────────── */

  if (!args.dryRun && args.fix && summary.errors.length === 0) {
    try {
      execFileSync('pnpm', ['lint:fix'], {
        cwd: REPO_ROOT,
        stdio: ['ignore', 'ignore', 'pipe'],
        shell: true,
      })
    } catch {
      summary.warnings.push(
        'pnpm lint:fix terminó con avisos: revisa `pnpm lint` a mano'
      )
    }
  }
  // lint:fix reordena imports sin respetar el formato: se vuelve a pasar
  // prettier sobre lo escrito para que `format:check` quede limpio.
  if (!args.dryRun && args.fix && prettier && summary.errors.length === 0) {
    for (const to of writtenDests) {
      const abs = resolve(REPO_ROOT, to)
      if (!existsSync(abs)) continue
      const current = readFileSync(abs, 'utf8')
      try {
        const formatted = await prettier.format(current, {
          ...prettierConfig,
          filepath: abs,
        })
        if (formatted !== current) await writeFile(abs, formatted)
      } catch {
        /* binarios o ficheros que prettier no entiende */
      }
    }
  }
  if (!args.dryRun && summary.errors.length === 0) {
    const files = {}
    for (const to of [...writtenDests].sort()) {
      const abs = resolve(REPO_ROOT, to)
      if (existsSync(abs)) {
        files[to] = {
          generated: generated.get(to),
          final: sha(readFileSync(abs, 'utf8')),
        }
      }
    }
    await writeFile(
      statePath,
      `${JSON.stringify({ source: source.commit, files }, null, 2)}\n`
    )
  }

  await source.cleanup()

  /* 7. Informe ───────────────────────────────────────────────────── */

  console.log(
    `Viajan ${travel.size} ficheros: ${summary.written.length} ` +
      `${args.dryRun ? 'cambiarían' : 'escritos'}, ${summary.unchanged} sin cambios.`
  )
  for (const line of summary.written) console.log(`  · ${line}`)
  if (assetReport.length > 0) {
    console.log(`\nImágenes (${assetReport.length}):`)
    for (const line of assetReport) console.log(`  · ${line}`)
  }
  if (summary.barrels.length > 0) {
    console.log('\nÍndices actualizados:')
    for (const line of summary.barrels) console.log(`  · ${line}`)
  }
  console.log(
    `\nCosturas resueltas por producción (${summary.seamsOk.size}): ` +
      [...summary.seamsOk].sort().join(', ')
  )
  if (summary.orphans.length > 0) {
    console.log(
      `\nFicheros que ya no vienen de Lovable ni tienen candado ` +
        `(${summary.orphans.length})${args.prune && !args.dryRun ? ' — borrados' : ' — usa --prune para borrarlos'}:`
    )
    for (const to of summary.orphans) console.log(`  · ${to}`)
  }
  for (const w of summary.warnings) console.log(`\n⚠ ${w}`)
  if (summary.errors.length > 0) {
    console.error(`\n✗ ${summary.errors.length} problemas a resolver:`)
    for (const e of summary.errors) console.error(`  ✗ ${e}`)
    process.exit(1)
  }
  console.log('\n✓ Porte sin problemas.')
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
