import { createBirpc } from 'birpc'
import { ref, shallowRef } from 'vue'

export interface ServerFunctions {
  'rspack:list-sessions': () => Promise<Array<{ id: string; timestamp: number; duration: number; hash: string }>>
  'rspack:get-session': (args: { session: string }) => Promise<any>
  'rspack:get-modules': (args: { session: string }) => Promise<any[]>
  'rspack:get-module-info': (args: { session: string; module: string }) => Promise<any>
  'rspack:get-chunks': (args: { session: string }) => Promise<any[]>
  'rspack:get-chunk-info': (args: { session: string; chunk: string }) => Promise<any>
  'rspack:get-assets': (args: { session: string }) => Promise<any[]>
  'rspack:get-entrypoints': (args: { session: string }) => Promise<any[]>
  'rspack:get-errors': (args: { session: string }) => Promise<any[]>
  'rspack:get-warnings': (args: { session: string }) => Promise<any[]>
  'rspack:get-module-graph': (args: { session: string }) => Promise<{ nodes: any[]; edges: any[] }>
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
}

const rpcInstance = shallowRef<ReturnType<typeof createBirpc<ServerFunctions, ClientFunctions>> | null>(null)
const connected = ref(false)
const buildNotification = ref<{ id: string; timestamp: number } | null>(null)

export function useRpc() {
  if (!rpcInstance.value) {
    initRpc()
  }
  return {
    rpc: rpcInstance,
    connected,
    buildNotification,
    call: async <K extends keyof ServerFunctions>(
      method: K,
      ...args: Parameters<ServerFunctions[K]>
    ): Promise<Awaited<ReturnType<ServerFunctions[K]>>> => {
      if (!rpcInstance.value) throw new Error('RPC not connected')
      return (rpcInstance.value as any)[method](...args)
    },
  }
}

function initRpc() {
  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${location.host}`

  const ws = new WebSocket(wsUrl)

  const rpc = createBirpc<ServerFunctions, ClientFunctions>(
    {
      'rspack:build-started': () => {},
      'rspack:build-completed': (session) => {
        buildNotification.value = session
      },
    },
    {
      post: (data) => ws.send(data),
      on: (handler) => {
        ws.addEventListener('message', (e) => handler(e.data))
      },
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  )

  ws.addEventListener('open', () => {
    connected.value = true
  })

  ws.addEventListener('close', () => {
    connected.value = false
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
  const nodeModulesIndex = path.lastIndexOf('node_modules')
  if (nodeModulesIndex !== -1) {
    return path.slice(nodeModulesIndex)
  }
  const parts = path.split('/')
  if (parts.length > 3) {
    return `.../${parts.slice(-3).join('/')}`
  }
  return path
}
