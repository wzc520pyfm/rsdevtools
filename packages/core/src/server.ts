import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebSocket as WsWebSocket } from 'ws'
import type { DevToolsNodeContext } from '@rspack-devtools/kit'
import type { ConnectionMeta, RspackDevToolsOptions } from './types'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createBirpc } from 'birpc'
import { getPort } from 'get-port-please'
import sirv from 'sirv'
import { WebSocketServer } from 'ws'
import { clientPublicDir as rspackClientDir } from '@rspack-devtools/rspack/dirs'
import { getInjectClientScript } from './inject'
import { RpcFunctionsHost } from './hosts/rpc-host'
import { DevToolsViewHost } from './hosts/view-host'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveClientDir(optionsClientDir?: string): string {
  if (optionsClientDir) return optionsClientDir

  if (existsSync(rspackClientDir)) return rspackClientDir

  return path.resolve(__dirname, '../client')
}

function renderClientImportsMap(context: DevToolsNodeContext): string {
  const entries = context.docks.values({ includeBuiltin: false })
  const imports: string[] = []

  for (const entry of entries) {
    if (entry.type === 'action' && 'action' in entry) {
      const key = `action:${entry.id}`
      const importName = entry.action.importName || 'default'
      imports.push(`  ${JSON.stringify(key)}: () => import(${JSON.stringify(entry.action.importFrom)}).then(r => r[${JSON.stringify(importName)}])`)
    }
    else if (entry.type === 'custom-render' && 'renderer' in entry) {
      const key = `custom-render:${entry.id}`
      const importName = entry.renderer.importName || 'default'
      imports.push(`  ${JSON.stringify(key)}: () => import(${JSON.stringify(entry.renderer.importFrom)}).then(r => r[${JSON.stringify(importName)}])`)
    }
    else if (entry.type === 'iframe' && 'clientScript' in entry && entry.clientScript) {
      const key = `iframe:${entry.id}`
      const importName = entry.clientScript.importName || 'default'
      imports.push(`  ${JSON.stringify(key)}: () => import(${JSON.stringify(entry.clientScript.importFrom)}).then(r => r[${JSON.stringify(importName)}])`)
    }
  }

  return `export const importsMap = {\n${imports.join(',\n')}\n};\n`
}

export interface DevToolsServer {
  port: number
  close: () => void
  broadcast: (method: string, args: any[]) => void
}

export async function startDevToolsServer(
  context: DevToolsNodeContext,
  options: RspackDevToolsOptions = {},
): Promise<DevToolsServer> {
  const host = options.host ?? 'localhost'
  const requestedPort = options.port ?? 7821
  const port = await getPort({ port: requestedPort, host })

  const rpcHost = context.rpc as RpcFunctionsHost
  const viewHost = context.views as DevToolsViewHost

  const resolvedHandlers = await rpcHost.resolveAllHandlers()

  const wsClients = new Set<any>()

  rpcHost._setBroadcast(async (broadcastOptions) => {
    for (const client of wsClients) {
      try {
        ;(client as any)[broadcastOptions.method]?.(...broadcastOptions.args)
      }
      catch {}
    }
  })

  const clientDir = resolveClientDir(options.clientDir)
  const serveStatic = sirv(clientDir, { dev: true, single: true })

  const pluginStaticHandlers: Array<{ baseUrl: string; handler: ReturnType<typeof sirv> }> = []
  for (const dir of viewHost.staticDirs) {
    pluginStaticHandlers.push({
      baseUrl: dir.baseUrl,
      handler: sirv(dir.distDir, { dev: true, single: true }),
    })
  }

  const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/'

    if (url === '/devtools-inject.js') {
      const currentDocks = context.docks.values({ includeBuiltin: false }) as any[]
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-cache')
      res.end(getInjectClientScript(port, host, currentDocks))
      return
    }

    if (url === '/.devtools/.connection.json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const meta: ConnectionMeta = { backend: 'websocket', websocket: port }
      res.end(JSON.stringify(meta))
      return
    }

    if (url === '/.devtools/api/health') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.end(JSON.stringify({ status: 'ok' }))
      return
    }

    if (url === '/.devtools/api/docks') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const entries = context.docks.values({ includeBuiltin: false })
      res.end(JSON.stringify(entries))
      return
    }

    // Client imports map for action/custom-render/iframe client scripts
    if (url === '/.devtools/client-imports.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-cache')
      res.end(renderClientImportsMap(context))
      return
    }

    // Launcher on-launch API (POST)
    if (url.startsWith('/.devtools/api/launch/') && req.method === 'POST') {
      const dockId = decodeURIComponent(url.slice('/.devtools/api/launch/'.length))
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      rpcHost.invokeLocal('devtoolskit:internal:docks:on-launch' as any, dockId)
        .then(() => { res.statusCode = 200; res.end(JSON.stringify({ ok: true })) })
        .catch((err: any) => { res.statusCode = 500; res.end(JSON.stringify({ error: err?.message })) })
      return
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      res.statusCode = 204
      res.end()
      return
    }

    for (const pluginHandler of pluginStaticHandlers) {
      if (url.startsWith(pluginHandler.baseUrl)) {
        const originalUrl = req.url
        req.url = url.slice(pluginHandler.baseUrl.length) || '/'
        pluginHandler.handler(req, res, () => {
          req.url = originalUrl
          serveStatic(req, res, () => {
            res.statusCode = 404
            res.end('Not found')
          })
        })
        return
      }
    }

    serveStatic(req, res, () => {
      res.statusCode = 404
      res.end('Not found')
    })
  })

  const wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (ws: WsWebSocket) => {
    const rpc = createBirpc<Record<string, any>, Record<string, any>>(
      resolvedHandlers,
      {
        post: (data) => {
          if (ws.readyState === ws.OPEN) ws.send(data)
        },
        on: (handler) => {
          ws.on('message', (data) => handler(data.toString()))
        },
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
    )

    wsClients.add(rpc)
    ws.on('close', () => wsClients.delete(rpc))
    ws.on('error', () => wsClients.delete(rpc))
  })

  return new Promise((resolve, reject) => {
    httpServer.listen(port, host, () => {
      resolve({
        port,
        close: () => {
          wss.close()
          httpServer.close()
        },
        broadcast: (method: string, args: any[]) => {
          for (const client of wsClients) {
            try {
              ;(client as any)[method]?.(...args)
            }
            catch {}
          }
        },
      })
    })
    httpServer.on('error', reject)
  })
}
