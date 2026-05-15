/**
 * Production static server for Cloud Run: serve `dist/`, SPA fallback,
 * optional www → apex redirect, long cache for /assets/*.
 */
import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 8080

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.ttf', 'font/ttf'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webmanifest', 'application/manifest+json'],
])

function hostNoPort(host) {
  if (!host) return ''
  return host.split(':')[0].toLowerCase()
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers)
  res.end(body)
}

async function serveIndex(res) {
  const indexPath = path.join(root, 'index.html')
  try {
    const html = await fs.readFile(indexPath)
    send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8' })
  } catch {
    send(res, 500, 'dist/index.html missing — run npm run build first.', {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }
}

async function handler(req, res) {
  const rawHost = req.headers.host || ''
  const host = hostNoPort(rawHost)
  if (host.startsWith('www.')) {
    const apex = host.slice(4)
    const dest = `https://${apex}${req.url || '/'}`
    res.writeHead(301, { Location: dest })
    res.end()
    return
  }

  let pathname
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname
  } catch {
    send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' })
    return
  }

  try {
    pathname = decodeURIComponent(pathname)
  } catch {
    send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' })
    return
  }

  if (pathname.endsWith('/')) pathname += 'index.html'

  const rel = pathname.replace(/^\/+/, '')
  const filePath = path.resolve(root, rel)
  const rootResolved = path.resolve(root)
  if (filePath !== rootResolved && !filePath.startsWith(rootResolved + path.sep)) {
    send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' })
    return
  }

  let st
  try {
    st = await fs.stat(filePath)
  } catch {
    return serveIndex(res)
  }

  if (!st.isFile()) {
    return serveIndex(res)
  }

  const ext = path.extname(filePath)
  const type = MIME.get(ext) || 'application/octet-stream'
  const body = await fs.readFile(filePath)
  const headers = { 'Content-Type': type }
  if (rel.startsWith('assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }
  send(res, 200, body, headers)
}

const server = http.createServer((req, res) => {
  handler(req, res).catch((err) => {
    console.error(err)
    send(res, 500, 'Internal Server Error', { 'Content-Type': 'text/plain; charset=utf-8' })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serving ${root} on 0.0.0.0:${PORT}`)
})
