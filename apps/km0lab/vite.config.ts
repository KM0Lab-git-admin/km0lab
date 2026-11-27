import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const POINTER_SUFFIX = '.asset.json'
const POINTER_PREFIX = '\0km0lab-asset-pointer:'
// El id virtual acaba en `.js` para que los plugins de JSON y de assets de
// Vite no intenten procesarlo como el fichero al que apunta.
const POINTER_EXT = '.js'

/**
 * Lovable no versiona algunos assets como binario, sino como un puntero
 * `<nombre>.<ext>.asset.json` hacia su CDN, y el código portado lo importa y
 * lee `.url`. En producción el binario vive en `src/assets` (lo baja
 * `pnpm sync:assets`), así que servimos un módulo con la misma forma pero
 * apuntando al asset local.
 */
function lovableAssetPointer(): Plugin {
  return {
    name: 'km0lab:lovable-asset-pointer',
    enforce: 'pre',
    resolveId(source) {
      if (!source.endsWith(POINTER_SUFFIX)) return null
      const asset = source.slice(0, -POINTER_SUFFIX.length)
      return `${POINTER_PREFIX}${asset}${POINTER_EXT}`
    },
    load(id) {
      if (!id.startsWith(POINTER_PREFIX)) return null
      const asset = id.slice(POINTER_PREFIX.length, -POINTER_EXT.length)
      return [
        `import url from ${JSON.stringify(asset)}`,
        'export { url }',
        'export default { url }',
      ].join('\n')
    },
  }
}

/**
 * Versión del producto: la del fichero `VERSION` de la raíz del repositorio,
 * que solo cambia el comando de publicar (docs/VERSIONES.md). El commit lo
 * pone quien compila: Vercel, GitHub o nadie en local.
 */
const APP_VERSION = fs
  .readFileSync(path.resolve(__dirname, '../../VERSION'), 'utf8')
  .trim()
const APP_COMMIT =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? ''

/**
 * Publica `version.json` junto a la app: de qué commit se construyó. Las
 * comprobaciones de después de un despliegue lo leen para saber que están
 * probando lo que se acaba de subir y no la versión anterior.
 */
function buildVersion(): Plugin {
  return {
    name: 'km0lab-build-version',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            version: APP_VERSION,
            commit: APP_COMMIT || null,
            builtAt: new Date().toISOString(),
          },
          null,
          2
        ),
      })
    },
  }
}

export default defineConfig({
  plugins: [lovableAssetPointer(), react(), buildVersion()],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __APP_COMMIT__: JSON.stringify(APP_COMMIT),
  },
  envDir: path.resolve(__dirname, 'env'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
