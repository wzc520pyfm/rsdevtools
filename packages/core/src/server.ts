import type { IncomingMessage } from 'node:http'
import type { WebSocket as WsWebSocket } from 'ws'
import type { DataCollector } from './collector'
import type { ClientFunctions, ConnectionMeta, RspackDevToolsOptions, ServerFunctions } from './types'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createBirpc } from 'birpc'
import { getPort } from 'get-port-please'
import sirv from 'sirv'
import { WebSocketServer } from 'ws'
import { createRpcFunctions } from './rpc'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface DevToolsServer {
  port: number
  close: () => void
  broadcast: (method: string, args: any[]) => void
}

export async function startDevToolsServer(
  collector: DataCollector,
  options: RspackDevToolsOptions = {},
): Promise<DevToolsServer> {
  const host = options.host ?? 'localhost'
  const requestedPort = options.port ?? 7821
  const port = await getPort({ port: requestedPort, host })

  const serverFunctions = createRpcFunctions(collector)
  const wsClients = new Set<ReturnType<typeof createBirpc<ClientFunctions, ServerFunctions>>>()

  const clientDir = options.clientDir ?? path.resolve(__dirname, '../client')
  const serveStatic = sirv(clientDir, { dev: true, single: true })

  const httpServer = createServer((req, res) => {
    if (req.url === '/.devtools/.connection.json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const meta: ConnectionMeta = { backend: 'websocket', websocket: port }
      res.end(JSON.stringify(meta))
      return
    }

    if (req.url === '/.devtools/api/health') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.end(JSON.stringify({ status: 'ok', sessions: collector.sessions.size }))
      return
    }

    serveStatic(req, res, () => {
      res.statusCode = 404
      res.end('Not found')
    })
  })

  const wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (ws: WsWebSocket, _req: IncomingMessage) => {
    const rpc = createBirpc<ClientFunctions, ServerFunctions>(serverFunctions, {
      post: (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(data)
        }
      },
      on: (handler) => {
        ws.on('message', (data) => {
          handler(data.toString())
        })
      },
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    })

    wsClients.add(rpc)

    ws.on('close', () => {
      wsClients.delete(rpc)
    })

    ws.on('error', (err) => {
      console.error('[Rspack DevTools] WebSocket error:', err.message)
      wsClients.delete(rpc)
    })
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
