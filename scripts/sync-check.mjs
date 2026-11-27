#!/usr/bin/env node
/**
 * sync-check.mjs — ensayo general del porte Lovable → producción.
 *
 * Copia el repo (tal como está en disco, sin node_modules) a una carpeta
 * temporal, ejecuta ahí `sync-lovable.mjs`, comprueba tipos y, con
 * `--build`, compila. No toca el repo real. Contesta PASA o NO PASA.
 *
 * Uso:
 *   pnpm sync:check                               # contra Lovable `main`
 *   pnpm sync:check -- --source ../km0lab-lovable # checkout local
 *   pnpm sync:check -- --build                    # además compila la app
 *   pnpm sync:check -- --keep                     # conserva la copia
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const has = (flag) => argv.includes(flag)
const valueOf = (flag) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : null
}

const run = (label, cmd, args, cwd) => {
  process.stdout.write(`\n▸ ${label}\n`)
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: true })
  return res.status === 0
}

const copy = mkdtempSync(join(os.tmpdir(), 'km0lab-sync-check-'))
let ok = false
try {
  // Ficheros versionados y nuevos sin ignorar, con su contenido en disco.
  const files = execFileSync(
    'git',
    ['ls-files', '-co', '--exclude-standard', '-z'],
    { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )
    .split('\0')
    .filter(Boolean)
  for (const file of files) {
    const from = join(REPO_ROOT, file)
    if (!existsSync(from)) continue
    mkdirSync(dirname(join(copy, file)), { recursive: true })
    cpSync(from, join(copy, file))
  }
  console.log(`Copia de ensayo: ${copy} (${files.length} ficheros)`)

  // Una fuente relativa se resuelve contra el repo real, no contra la copia.
  const sourceArg = valueOf('--source')
  const source =
    sourceArg && !/^https?:\/\//.test(sourceArg)
      ? resolve(REPO_ROOT, sourceArg)
      : sourceArg
  const syncArgs = ['scripts/sync-lovable.mjs', '--no-fix', '--prune']
  if (source) syncArgs.push('--source', `"${source}"`)

  const installed = run(
    'Instalando dependencias en la copia',
    'pnpm',
    ['install', '--frozen-lockfile', '--prefer-offline', '--ignore-scripts'],
    copy
  )
  const synced = installed && run('Porte', 'node', syncArgs, copy)
  const typed =
    installed && run('Tipos', 'pnpm', ['turbo', 'run', 'type:check'], copy)
  const built =
    !has('--build') ||
    (installed &&
      run('Compilación', 'pnpm', ['--filter', 'km0lab', 'build'], copy))
  ok = installed && synced && typed && built
} finally {
  if (has('--keep')) console.log(`\nCopia conservada en ${copy}`)
  else rmSync(copy, { recursive: true, force: true })
}

console.log(ok ? '\n✓ PASA: el porte no rompe nada.' : '\n✗ NO PASA.')
process.exit(ok ? 0 : 1)
