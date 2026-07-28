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

export default defineConfig({
  plugins: [lovableAssetPointer(), react()],
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
