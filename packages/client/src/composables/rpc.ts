import { createBirpc } from 'birpc'
import { ref, shallowRef } from 'vue'

export interface LogsListResult {
  entries: any[]
  removedIds: string[]
  version: number
}

export interface ServerFunctions {
  'rspack:list-sessions': () => Promise<Array<{ id: string; timestamp: number; duration: number; hash: string }>>
  'rspack:get-session': (args: { session: string }) => Promise<any>
  'rspack:get-modules': (args: { session: string }) => Promise<any[]>
  'rspack:get-module-info': (args: { session: string; module: string }) => Promise<any>
  'rspack:get-chunks': (args: { session: string }) => Promise<any[]>
  'rspack:get-chunk-info': (args: { session: string; chunk: string }) => Promise<any>
  'rspack:get-assets': (args: { session: string }) => Promise<any[]>
  'rspack:get-asset-details': (args: { session: string; asset: string }) => Promise<any>
  'rspack:get-entrypoints': (args: { session: string }) => Promise<any[]>
  'rspack:get-errors': (args: { session: string }) => Promise<any[]>
  'rspack:get-warnings': (args: { session: string }) => Promise<any[]>
  'rspack:get-module-graph': (args: { session: string }) => Promise<{ nodes: any[]; edges: any[] }>
  'rspack:get-plugins': (args: { session: string }) => Promise<any[]>
  'rspack:get-packages': (args: { session: string }) => Promise<any[]>
  'rspack:get-package-details': (args: { session: string; name: string }) => Promise<any>
  'rspack:compare-sessions': (args: { sessions: string[] }) => Promise<any>
  'rspack:open-in-editor': (args: { path: string; line?: number; column?: number }) => Promise<void>
  'rspack:open-in-finder': (args: { path: string }) => Promise<void>
  'rspack:get-terminals': () => Promise<any[]>
  'rspack:run-terminal': (args: { command: string; cwd?: string; name?: string }) => Promise<string>
  'rspack:list-files': (args: { targetDir?: string }) => Promise<any[]>
  'rspack:read-file': (args: { path: string }) => Promise<any>
  'rspack:write-file': (args: { path: string; content: string }) => Promise<void>
  'rspack:get-file-info': () => Promise<any>
  'devtoolskit:internal:logs:list': (since?: number) => Promise<LogsListResult>
  'devtoolskit:internal:logs:add': (input: any) => Promise<any>
  'devtoolskit:internal:logs:update': (id: string, patch: any) => Promise<any>
  'devtoolskit:internal:logs:remove': (id: string) => Promise<void>
  'devtoolskit:internal:logs:clear': () => Promise<void>
  'devtoolskit:internal:docks:on-launch': (dockId: string) => Promise<void>
  'devtoolskit:self-inspect:get-docks': () => Promise<any[]>
  'devtoolskit:self-inspect:get-rpc-functions': () => Promise<any[]>
  'devtoolskit:self-inspect:get-client-scripts': () => Promise<any[]>
  'devtoolskit:self-inspect:get-devtools-plugins': () => Promise<any[]>
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
  'rspack:terminal-output': (args: { id: string; data: string }) => void
  'rspack:terminal-exit': (args: { id: string; exitCode: number }) => void
  'devtoolskit:internal:logs:updated': () => void
  'devtoolskit:internal:terminals:updated': () => void
  'devtoolskit:internal:terminals:stream-chunk': (data: { id: string; data: string }) => void
}

const rpcInstance = shallowRef<ReturnType<typeof createBirpc<ServerFunctions, ClientFunctions>> | null>(null)
const connected = ref(false)
const buildNotification = ref<{ id: string; timestamp: number } | null>(null)
const terminalOutputs = ref<Map<string, string>>(new Map())
const logsUpdateListeners = new Set<() => void>()

let readyPromise: Promise<void> | null = null
let readyResolve: (() => void) | null = null

function waitForConnection(): Promise<void> {
  if (connected.value) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = new Promise(r => { readyResolve = r })
  }
  return readyPromise
}

export function useRpc() {
  if (!rpcInstance.value) initRpc()
  return {
    rpc: rpcInstance,
    connected,
    buildNotification,
    terminalOutputs,
    call: async <K extends keyof ServerFunctions>(
      method: K,
      ...args: Parameters<ServerFunctions[K]>
    ): Promise<Awaited<ReturnType<ServerFunctions[K]>>> => {
      await waitForConnection()
      if (!rpcInstance.value) throw new Error('RPC not connected')
      return (rpcInstance.value as any)[method](...args)
    },
    onLogsUpdated: (fn: () => void) => {
      logsUpdateListeners.add(fn)
      return () => logsUpdateListeners.delete(fn)
    },
  }
}

function initRpc() {
  readyPromise = new Promise(r => { readyResolve = r })

  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${location.host}`
  const ws = new WebSocket(wsUrl)

  let pendingMessages: string[] = []

  const rpc = createBirpc<ServerFunctions, ClientFunctions>(
    {
      'rspack:build-started': () => {},
      'rspack:build-completed': (session) => { buildNotification.value = session },
      'rspack:terminal-output': ({ id, data }) => {
        const current = terminalOutputs.value.get(id) ?? ''
        terminalOutputs.value.set(id, current + data)
      },
      'rspack:terminal-exit': () => {},
      'devtoolskit:internal:logs:updated': () => {
        logsUpdateListeners.forEach(fn => fn())
      },
      'devtoolskit:internal:terminals:updated': () => {},
      'devtoolskit:internal:terminals:stream-chunk': ({ id, data }) => {
        const current = terminalOutputs.value.get(id) ?? ''
        terminalOutputs.value.set(id, current + data)
      },
    },
    {
      post: (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data)
        } else {
          pendingMessages.push(data)
        }
      },
      on: (handler) => ws.addEventListener('message', (e) => handler(e.data)),
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  )

  ws.addEventListener('open', () => {
    connected.value = true
    readyResolve?.()
    readyPromise = null
    readyResolve = null
    for (const msg of pendingMessages) {
      ws.send(msg)
    }
    pendingMessages = []
  })

  ws.addEventListener('close', () => {
    connected.value = false
    rpcInstance.value = null
    setTimeout(initRpc, 3000)
  })

  ws.addEventListener('error', () => {
    connected.value = false
  })

  rpcInstance.value = rpc
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function shortenPath(path: string): string {
  const nmIdx = path.lastIndexOf('node_modules')
  if (nmIdx !== -1) return path.slice(nmIdx)
  const parts = path.split('/')
  return parts.length > 3 ? `.../${parts.slice(-3).join('/')}` : path
}

export function getFileIcon(name: string): string {
  if (/\.jsx?$/.test(name)) return 'i-carbon-logo-javascript text-yellow-500'
  if (/\.tsx?$/.test(name)) return 'i-carbon-code text-blue-500'
  if (/\.css$/.test(name)) return 'i-carbon-color-palette text-blue-400'
  if (/\.s[ac]ss$/.test(name)) return 'i-carbon-color-palette text-pink-500'
  if (/\.less$/.test(name)) return 'i-carbon-color-palette text-indigo-500'
  if (/\.html?$/.test(name)) return 'i-carbon-html text-orange-500'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'i-carbon-image text-green-500'
  if (/\.(woff2?|ttf|eot)$/.test(name)) return 'i-carbon-text-font text-purple-500'
  if (/\.json$/.test(name)) return 'i-carbon-json text-yellow-600'
  if (/\.map$/.test(name)) return 'i-carbon-map text-gray-400'
  if (/\.vue$/.test(name)) return 'i-carbon-application text-green-600'
  return 'i-carbon-document text-gray-500'
}
