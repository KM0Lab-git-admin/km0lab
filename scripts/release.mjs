#!/usr/bin/env node
/**
 * Publicar una versión del producto. Ver docs/VERSIONES.md.
 *
 *   pnpm release                 # en qué versión estamos y qué hay sin publicar
 *   pnpm release 1.1.0           # ENSEÑA lo que haría; no cambia nada
 *   pnpm release 1.1.0 --apply   # lo hace: numera, notas, commit y etiqueta
 *   pnpm release 1.1.0 --apply --push   # y además lo sube
 *
 * Una versión es de todo el producto: la misma en la app, la API, el
 * backoffice y el servidor de eventos. Este comando recorre los
 * repositorios hermanos que encuentre junto a `km0lab`.
 *
 * Qué hace con --apply, en cada repositorio:
 *   1. Escribe la versión en `VERSION` (y donde haga falta: package.json,
 *      número de Android).
 *   2. Añade las notas de la versión a `CHANGELOG.md`, sacadas de los
 *      commits desde la etiqueta anterior.
 *   3. Guarda un commit `chore(release): publica la X.Y.Z`.
 *   4. Pone la etiqueta `vX.Y.Z` en ese punto.
 *
 * Antes comprueba que cada repositorio está en `develop`, sin cambios a
 * medias y al día con GitHub, y lanza las pruebas (rápidas y recorridos
 * contra UAT). `--skip-checks` se las salta.
 *
 * No sube nada sin `--push`. Subir `develop` publica en UAT.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const valueOf = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

const APPLY = flag('--apply')
const PUSH = flag('--push')
const SKIP_CHECKS = flag('--skip-checks')
const km0lab = path.resolve(valueOf('--repo') ?? path.join(here, '..'))
const workspace = path.resolve(
  valueOf('--workspace') ?? path.join(km0lab, '..')
)
const version = args.find((a) => /^\d+\.\d+\.\d+$/.test(a))
const unknown = args.find(
  (a, i) =>
    a !== version &&
    !['--apply', '--push', '--skip-checks', '--repo', '--workspace'].includes(
      a
    ) &&
    !['--repo', '--workspace'].includes(args[i - 1])
)

/** Las piezas del producto. La primera es este repositorio. */
const REPOS = [
  { name: 'km0lab', label: 'App', dir: km0lab },
  { name: 'km0lab-api', label: 'API', dir: path.join(workspace, 'km0lab-api') },
  {
    name: 'km0lab-backoffice',
    label: 'Backoffice',
    dir: path.join(workspace, 'km0lab-backoffice'),
  },
  {
    name: 'events-query',
    label: 'Agenda y noticias',
    dir: path.join(workspace, 'events-query'),
  },
].filter((r) => fs.existsSync(path.join(r.dir, '.git')))

const say = (line = '') => process.stdout.write(`${line}\n`)
const fail = (message) => {
  process.stderr.write(`\nNO SE PUBLICA: ${message}\n`)
  process.exit(1)
}

const git = (dir, ...cmd) =>
  execFileSync('git', cmd, { cwd: dir, encoding: 'utf8' }).trim()
const tryGit = (dir, ...cmd) => {
  try {
    return execFileSync('git', cmd, {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const parse = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec((v ?? '').trim())
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}
const compare = (a, b) => {
  const pa = parse(a)
  const pb = parse(b)
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

/** El número interno de Android: siempre sube si sube la versión. */
export const androidVersionCode = (v) => {
  const [major, minor, patch] = parse(v)
  return major * 10000 + minor * 100 + patch
}

const readVersion = (dir) => {
  const file = path.join(dir, 'VERSION')
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : null
}

const lastTag = (dir) =>
  tryGit(dir, 'describe', '--tags', '--match', 'v[0-9]*', '--abbrev=0')

// ── Notas de la versión ────────────────────────────────────────────────

const SECTIONS = [
  { title: 'Novedades', types: ['feat'] },
  { title: 'Arreglos', types: ['fix', 'perf'] },
]

const commitsSince = (dir, tag) => {
  const range = tag ? `${tag}..HEAD` : 'HEAD'
  const out = tryGit(dir, 'log', range, '--no-merges', '--format=%s')
  return out ? out.split('\n') : []
}

const notesFor = (dir, tag) => {
  const subjects = commitsSince(dir, tag)
  const parsed = subjects.map((subject) => {
    const m = /^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/.exec(subject)
    return m
      ? { type: m[1], scope: m[2] ?? '', text: m[3] }
      : { type: 'otro', scope: '', text: subject }
  })
  const lines = []
  for (const section of SECTIONS) {
    const items = parsed.filter((c) => section.types.includes(c.type))
    if (items.length === 0) continue
    lines.push(`### ${section.title}`, '')
    for (const item of items) {
      const where = item.scope ? `**${item.scope}:** ` : ''
      lines.push(`- ${where}${item.text}`)
    }
    lines.push('')
  }
  const shown = SECTIONS.flatMap((s) => s.types)
  const rest = parsed.filter(
    (c) => !shown.includes(c.type) && c.type !== 'chore'
  ).length
  const chores = parsed.filter((c) => c.type === 'chore').length
  if (rest + chores > 0) {
    lines.push(
      '### Otros cambios',
      '',
      `- ${rest + chores} cambios internos (pruebas, documentación y mantenimiento).`,
      ''
    )
  }
  if (!tag) {
    lines.unshift(
      'Primera publicación con número de versión. Recoge todo lo anterior.',
      ''
    )
  }
  if (lines.length === 0) lines.push('Sin cambios en esta pieza.', '')
  return { count: subjects.length, body: lines.join('\n').trimEnd() }
}

const today = () => new Date().toISOString().slice(0, 10)

const prependChangelog = (dir, heading, body) => {
  const file = path.join(dir, 'CHANGELOG.md')
  const intro =
    '# Notas de versión\n\n' +
    'Qué cambió en cada publicación. Lo escribe `pnpm release` (repositorio\n' +
    '`km0lab`, `docs/VERSIONES.md`) a partir de los commits; no se edita a mano.\n'
  const previous = fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
    : intro
  const at = previous.indexOf('\n## ')
  const head = at >= 0 ? previous.slice(0, at + 1) : `${previous.trimEnd()}\n`
  const tail = at >= 0 ? previous.slice(at + 1) : ''
  fs.writeFileSync(
    file,
    `${head}\n${heading}\n\n${body}\n\n${tail}`.replace(/\n{3,}/g, '\n\n')
  )
  return 'CHANGELOG.md'
}

// ── Dónde se escribe la versión ────────────────────────────────────────

const replaceInFile = (file, pattern, replacement) => {
  if (!fs.existsSync(file)) return false
  const before = fs.readFileSync(file, 'utf8')
  if (!pattern.test(before)) return false
  fs.writeFileSync(file, before.replace(pattern, replacement))
  return true
}

const stampVersion = (repo, v) => {
  const touched = []
  fs.writeFileSync(path.join(repo.dir, 'VERSION'), `${v}\n`)
  touched.push('VERSION')

  if (repo.name === 'km0lab') {
    for (const pkg of [
      'apps/km0lab/package.json',
      'packages/app/package.json',
    ]) {
      if (
        replaceInFile(
          path.join(repo.dir, pkg),
          /("version":\s*")[^"]+(")/,
          `$1${v}$2`
        )
      ) {
        touched.push(pkg)
      }
    }
    const gradle = 'apps/km0lab/android/app/build.gradle'
    const gradleFile = path.join(repo.dir, gradle)
    const a = replaceInFile(
      gradleFile,
      /versionCode\s+\d+/,
      `versionCode ${androidVersionCode(v)}`
    )
    const b = replaceInFile(
      gradleFile,
      /versionName\s+"[^"]*"/,
      `versionName "${v}"`
    )
    if (a || b) touched.push(gradle)
  }
  return touched
}

// ── Comprobaciones ─────────────────────────────────────────────────────

const checkRepo = (repo) => {
  const branch = git(repo.dir, 'rev-parse', '--abbrev-ref', 'HEAD')
  if (branch !== 'develop') {
    fail(`${repo.name} está en la rama «${branch}», no en develop.`)
  }
  if (git(repo.dir, 'status', '--porcelain')) {
    fail(`${repo.name} tiene cambios sin guardar. Guárdalos o descártalos.`)
  }
  tryGit(repo.dir, 'fetch', '--quiet', 'origin')
  const behind = Number(
    tryGit(repo.dir, 'rev-list', '--count', 'HEAD..origin/develop') || '0'
  )
  if (behind > 0) {
    fail(
      `${repo.name} va ${behind} cambios por detrás de GitHub. Haz antes «git pull».`
    )
  }
  if (tryGit(repo.dir, 'tag', '--list', `v${version}`)) {
    fail(`${repo.name} ya tiene la etiqueta v${version}.`)
  }
}

const run = (label, command, commandArgs, options = {}) => {
  say(`\n— ${label}`)
  const result = spawnSync([command, ...commandArgs].join(' '), {
    cwd: km0lab,
    stdio: 'inherit',
    shell: true,
    ...options,
  })
  if (result.status !== 0) fail(`${label}: ha fallado.`)
}

const runChecks = () => {
  run('Pruebas rápidas de la app', 'pnpm', ['test'])
  const tokenFile = path.join(km0lab, 'packages/e2e/.qa-token')
  const withToken = !!process.env.E2E_QA_TOKEN || fs.existsSync(tokenFile)
  run(
    withToken
      ? 'Recorridos completos contra UAT'
      : 'Recorridos de lectura contra UAT (sin clave del robot)',
    'pnpm',
    ['--filter', '@km0lab/e2e', 'exec', 'playwright', 'test', '--reporter=dot'],
    {
      env: {
        ...process.env,
        E2E_TARGET: 'uat',
        ...(withToken ? {} : { E2E_SCOPE: 'lectura' }),
      },
    }
  )
}

// ── Principal ──────────────────────────────────────────────────────────

const status = () => {
  say('Versión de cada pieza:\n')
  for (const repo of REPOS) {
    const tag = lastTag(repo.dir)
    const pending = commitsSince(repo.dir, tag).length
    say(
      `  ${repo.label.padEnd(18)} ${String(readVersion(repo.dir) ?? 'sin VERSION').padEnd(12)}` +
        `etiqueta: ${(tag || 'ninguna').padEnd(9)} sin publicar: ${pending} cambios`
    )
  }
  const current = readVersion(km0lab) ?? '0.0.0'
  const [major, minor, patch] = parse(current) ?? [0, 0, 0]
  say(`\nPara publicar:`)
  say(`  pnpm release ${major}.${minor + 1}.0     publicación normal`)
  say(`  pnpm release ${major}.${minor}.${patch + 1}     arreglo urgente`)
  say(`  pnpm release ${major + 1}.0.0     deja de admitir las apps anteriores`)
  say('\nSin --apply solo enseña lo que haría.')
}

const main = () => {
  if (unknown)
    fail(`No entiendo «${unknown}». Mira la cabecera de este fichero.`)
  if (REPOS.length === 0) fail(`No encuentro repositorios en ${workspace}.`)
  if (!version) {
    status()
    return
  }

  const current = readVersion(km0lab) ?? '0.0.0'
  if (!parse(current)) fail(`El fichero VERSION dice «${current}».`)
  if (compare(version, current) <= 0) {
    fail(`La ${version} no es posterior a la actual (${current}).`)
  }

  say(`Publicación ${version}  (la actual es la ${current})`)
  say(
    APPLY ? 'Modo: SE HACE.' : 'Modo: SOLO ENSEÑA. Añade --apply para hacerlo.'
  )

  for (const repo of REPOS) checkRepo(repo)
  say(`\nRepositorios en develop, limpios y al día: ${REPOS.length}`)

  if (APPLY && !SKIP_CHECKS) runChecks()
  if (!APPLY && !SKIP_CHECKS) {
    say(
      'Con --apply se lanzan antes las pruebas rápidas y los recorridos de UAT.'
    )
  }

  const heading = `## ${version} — ${today()}`
  const product = [`# Versión ${version}`, '', `Publicada el ${today()}.`, '']

  for (const repo of REPOS) {
    const tag = lastTag(repo.dir)
    const notes = notesFor(repo.dir, tag)
    say(
      `\n── ${repo.label} (${repo.name}) · ${notes.count} cambios desde ${tag || 'el principio'}`
    )
    say(notes.body.split('\n').slice(0, 14).join('\n'))
    product.push(
      `## ${repo.label}`,
      '',
      notes.body.replace(/^### /gm, '### '),
      ''
    )

    if (!APPLY) continue

    const touched = stampVersion(repo, version)
    touched.push(prependChangelog(repo.dir, heading, notes.body))
    repo.touched = touched
  }

  if (!APPLY) {
    say(`\nNúmero interno de Android: ${androidVersionCode(version)}`)
    say('\nNo se ha cambiado nada.')
    return
  }

  // Las notas del producto entero viven en este repositorio.
  const releaseNote = `docs/versiones/${version}.md`
  fs.mkdirSync(path.join(km0lab, 'docs/versiones'), { recursive: true })
  fs.writeFileSync(
    path.join(km0lab, releaseNote),
    `${product.join('\n').trimEnd()}\n`
  )
  REPOS[0].touched.push(releaseNote)

  // Este repositorio comprueba el formato al guardar: se deja como lo quiere.
  const formatted = REPOS[0].touched.filter((f) => /\.(md|json)$/.test(f))
  spawnSync(['pnpm', 'prettier', '--write', ...formatted].join(' '), {
    cwd: km0lab,
    stdio: 'ignore',
    shell: true,
  })

  for (const repo of REPOS) {
    git(repo.dir, 'add', '--', ...repo.touched)
    git(repo.dir, 'commit', '-m', `chore(release): publica la ${version}`)
    git(repo.dir, 'tag', '-a', `v${version}`, '-m', `Versión ${version}`)
    say(`  ${repo.name}: guardado y etiquetado v${version}`)
  }

  if (PUSH) {
    for (const repo of REPOS) {
      git(repo.dir, 'push', 'origin', 'develop', `v${version}`)
      say(`  ${repo.name}: subido`)
    }
    say(`\nVersión ${version} publicada. UAT se actualiza sola.`)
    return
  }

  say(`\nVersión ${version} preparada en local. Para subirla:`)
  for (const repo of REPOS) {
    say(
      `  git -C ${path.relative(process.cwd(), repo.dir) || '.'} push origin develop v${version}`
    )
  }
  say('\nPara la app de Android: docs/ANDROID-RELEASE.md.')
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main()
}
