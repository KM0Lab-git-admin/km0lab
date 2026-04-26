const { spawn } = require('node:child_process')
const fsp = require('node:fs/promises')
const path = require('node:path')

const { startStaticServer } = require('./static-server.cjs')

const REPO_ROOT = path.resolve(__dirname, '../../../..')
const KM0LAB_DIST = path.resolve(REPO_ROOT, 'apps/km0lab/dist')

async function distExists() {
  try {
    const stat = await fsp.stat(path.resolve(KM0LAB_DIST, 'index.html'))
    return stat.isFile()
  } catch {
    return false
  }
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['--filter', 'km0lab', 'build:web'],
      {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        shell: true,
        env: process.env,
      }
    )

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`pnpm build:web exited with code ${code}`))
    })
  })
}

async function ensureBuild({ forceBuild }) {
  if (!forceBuild && (await distExists())) {
    return
  }
  await runBuild()
}

async function buildAndServe({ port = 4173, forceBuild = false } = {}) {
  await ensureBuild({ forceBuild })
  const server = await startStaticServer({ rootDir: KM0LAB_DIST, port })
  return server
}

module.exports = { buildAndServe, KM0LAB_DIST, REPO_ROOT }
