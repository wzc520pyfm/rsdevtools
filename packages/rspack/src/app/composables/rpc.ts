import type { BuildSession, SessionComparison } from '../../shared/types'
import { createBirpc } from 'birpc'
import { reactive, shallowRef } from 'vue'

export interface ServerFunctions {
  'rspack:list-sessions': () => Promise<Array<{ id: string; timestamp: number; duration: number; hash: string }>>
  'rspack:get-session': (args: { session: string }) => Promise<BuildSession | null>
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
  'rspack:compare-sessions': (args: { sessions: string[] }) => Promise<SessionComparison | null>
  'rspack:open-in-editor': (args: { path: string; line?: number; column?: number }) => Promise<void>
  'rspack:open-in-finder': (args: { path: string }) => Promise<void>
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
}

const rpcInstance = shallowRef<ReturnType<typeof createBirpc<ServerFunctions, ClientFunctions>> | null>(null)

export const connectionState = reactive({
  connected: false,
  error: null as string | null,
})

const buildNotification = shallowRef<{ id: string; timestamp: number } | null>(null)

let readyPromise: Promise<void> | null = null
let readyResolve: (() => void) | null = null

function waitForConnection(): Promise<void> {
  if (connectionState.connected) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = new Promise(r => { readyResolve = r })
  }
  return readyPromise
}

export function useRpc() {
  return {
    rpc: rpcInstance,
    connectionState,
    buildNotification,
    call: async <K extends keyof ServerFunctions>(
      method: K,
      ...args: Parameters<ServerFunctions[K]>
    ): Promise<Awaited<ReturnType<ServerFunctions[K]>>> => {
      await waitForConnection()
      if (!rpcInstance.value) throw new Error('RPC not connected')
      return (rpcInstance.value as any)[method](...args)
    },
  }
}

export function connect() {
  if (rpcInstance.value) return

  readyPromise = new Promise(r => { readyResolve = r })

  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${location.host}`
  const ws = new WebSocket(wsUrl)

  let pendingMessages: string[] = []

  const rpc = createBirpc<ServerFunctions, ClientFunctions>(
    {
      'rspack:build-started': () => {},
      'rspack:build-completed': (session) => { buildNotification.value = session },
    },
    {
      post: (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data)
        }
        else {
          pendingMessages.push(data)
        }
      },
      on: (handler) => ws.addEventListener('message', e => handler(e.data)),
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  )

  ws.addEventListener('open', () => {
    connectionState.connected = true
    connectionState.error = null
    readyResolve?.()
    readyPromise = null
    readyResolve = null
    for (const msg of pendingMessages) {
      ws.send(msg)
    }
    pendingMessages = []
  })

  ws.addEventListener('close', () => {
    connectionState.connected = false
    rpcInstance.value = null
    setTimeout(connect, 3000)
  })

  ws.addEventListener('error', () => {
    connectionState.connected = false
    connectionState.error = 'Failed to connect to Rspack DevTools server'
  })

  rpcInstance.value = rpc
}
