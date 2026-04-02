import { execFileSync } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'

const MAX_COMMITS = 3
const PREFIX = '/__wireframe-git-history'

function parseGithubWebBase(cwd: string): string | null {
  try {
    const raw = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf-8' }).trim()
    const ssh = /^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i.exec(raw)
    if (ssh) return `https://github.com/${ssh[1]}/${ssh[2]}`
    const https = /^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/i.exec(raw)
    if (https) return `https://github.com/${https[1]}/${https[2]}`
  } catch {
    /* not a clone or no origin */
  }
  return null
}

function isSafeRepoRelative(p: string, root: string): boolean {
  if (!p || p.includes('..')) return false
  if (path.isAbsolute(p)) return false
  const resolved = path.resolve(root, p)
  const normalizedRoot = path.resolve(root)
  return resolved === normalizedRoot || resolved.startsWith(`${normalizedRoot}${path.sep}`)
}

function handleHistory(root: string, req: IncomingMessage, res: ServerResponse): boolean {
  const url = req.url ?? ''
  if (!url.startsWith(PREFIX) || req.method !== 'GET') return false

  try {
    const u = new URL(url, 'http://localhost')
    const paths = u.searchParams.getAll('path').filter(Boolean)
    if (paths.length === 0) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Missing path query parameter(s)', commits: [] }))
      return true
    }
    for (const p of paths) {
      if (!isSafeRepoRelative(p, root)) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Invalid path', commits: [] }))
        return true
      }
    }

    const args = ['log', `-n${MAX_COMMITS}`, '--format=%H%x1f%an%x1f%aI%x1f%s', '--', ...paths]
    let out: string
    try {
      out = execFileSync('git', args, { cwd: root, encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 })
    } catch {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          commits: [],
          error: 'Git log failed (not a git repository or git unavailable)',
          githubBase: parseGithubWebBase(root),
          primaryPath: paths[0],
        }),
      )
      return true
    }

    const lines = out.trim().split('\n').filter(Boolean)
    const githubBase = parseGithubWebBase(root)
    const primaryPath = paths[0]

    const commits = lines.map((line) => {
      const parts = line.split('\x1f')
      const hash = parts[0] ?? ''
      const author = parts[1] ?? ''
      const date = parts[2] ?? ''
      const subject = parts.slice(3).join('\x1f')
      const links = {
        commit: githubBase ? `${githubBase}/commit/${hash}` : '',
        blob: githubBase && primaryPath ? `${githubBase}/blob/${hash}/${primaryPath}` : '',
      }
      return { hash, author, date, subject, links }
    })

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ commits, githubBase, primaryPath }))
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: String(err), commits: [] }))
  }
  return true
}

function attachMiddleware(middlewares: ViteDevServer['middlewares'], root: string) {
  middlewares.use((req, res, next) => {
    if (handleHistory(root, req as IncomingMessage, res as ServerResponse)) return
    next()
  })
}

export function wireframeGitHistoryPlugin(): Plugin {
  return {
    name: 'wireframe-git-history',
    configureServer(server: ViteDevServer) {
      attachMiddleware(server.middlewares, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachMiddleware(server.middlewares, server.config.root)
    },
  }
}
