const fs = require('node:fs')
const fsp = require('node:fs/promises')
const http = require('node:http')
const path = require('node:path')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

async function fileExists(filePath) {
  try {
    const stat = await fsp.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

async function resolveTarget(rootDir, requestUrl) {
  const decoded = decodeURIComponent(requestUrl.split('?')[0] ?? '/')
  const safePath = path.normalize(decoded).replace(/^([\\/])+/, '')
  const candidate = path.resolve(rootDir, safePath)

  if (!candidate.startsWith(rootDir)) {
    return null
  }

  if (await fileExists(candidate)) {
    return candidate
  }

  const indexCandidate = path.resolve(candidate, 'index.html')
  if (await fileExists(indexCandidate)) {
    return indexCandidate
  }

  return path.resolve(rootDir, 'index.html')
}

function startStaticServer({ rootDir, port }) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const target = await resolveTarget(rootDir, req.url ?? '/')
        if (!target || !(await fileExists(target))) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Not Found')
          return
        }

        res.writeHead(200, {
          'Content-Type': getMimeType(target),
          'Cache-Control': 'no-store',
        })
        fs.createReadStream(target).pipe(res)
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(`Server error: ${error?.message ?? 'unknown'}`)
      }
    })

    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      const resolvedPort = typeof address === 'object' && address ? address.port : port
      resolve({
        url: `http://127.0.0.1:${resolvedPort}`,
        close: () =>
          new Promise((resolveClose) => {
            server.close(() => resolveClose())
          }),
      })
    })
  })
}

module.exports = { startStaticServer }
