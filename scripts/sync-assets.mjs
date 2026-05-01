#!/usr/bin/env node
/**
 * sync-assets.mjs
 *
 * Sincroniza los assets visuales (imágenes, iconos, banderas) desde el repo
 * de Lovable (`speak-spanish-easily`) hacia los paths de producción en este
 * monorepo, según el manifest `scripts/assets-manifest.json`.
 *
 * Política: Lovable es la "source of truth" de los assets visuales. Este
 * script SOBRESCRIBE siempre el destino con el contenido remoto. Cualquier
 * edición manual de los binarios en producción se perderá en la próxima
 * ejecución. Si necesitas cambiar un asset, hazlo en Lovable y vuelve a
 * ejecutar `pnpm sync:assets`.
 *
 * Uso:
 *   pnpm sync:assets
 *
 * Requiere Node 20+ (usa fetch global y fs/promises).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const MANIFEST_PATH = resolve(SCRIPT_DIR, 'assets-manifest.json')

async function loadManifest() {
  const raw = await readFile(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(raw)
  if (typeof manifest.source !== 'string' || !Array.isArray(manifest.assets)) {
    throw new Error(
      'manifest inválido: debe tener "source" (string) y "assets" (array)'
    )
  }
  return manifest
}

async function downloadAsset(url, destAbs) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await mkdir(dirname(destAbs), { recursive: true })
  await writeFile(destAbs, buffer)
  return buffer.length
}

async function main() {
  const manifest = await loadManifest()
  const source = manifest.source.replace(/\/+$/, '')

  console.log(`Sincronizando ${manifest.assets.length} assets desde:`)
  console.log(`  ${source}\n`)

  let okCount = 0
  let failCount = 0

  for (const asset of manifest.assets) {
    const url = `${source}/${asset.from}`
    const destAbs = resolve(REPO_ROOT, asset.to)
    process.stdout.write(`  · ${asset.to}  ←  ${asset.from} ... `)
    try {
      const bytes = await downloadAsset(url, destAbs)
      console.log(`OK (${bytes} bytes)`)
      okCount += 1
    } catch (err) {
      console.log(`FAIL`)
      console.error(`    ${err.message}`)
      failCount += 1
    }
  }

  console.log(`\nResumen: ${okCount} sincronizados, ${failCount} con error.`)
  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
