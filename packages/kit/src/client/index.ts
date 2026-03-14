import type { ConnectionMeta } from '../types/context'
import type { DevToolsLogEntry, DevToolsLogEntryInput, DevToolsLogHandle } from '../types/logs'
import type { DevToolsRpcServerFunctions } from '../types/rpc'

export interface DevToolsRpcClient {
  call: <T extends keyof DevToolsRpcServerFunctions>(
    method: T,
    ...args: Parameters<DevToolsRpcServerFunctions[T]>
  ) => Promise<Awaited<ReturnType<DevToolsRpcServerFunctions[T]>>>
}

export interface DevToolsClientScriptContext {
  current: {
    rpc: DevToolsRpcClient
    events: {
      on: (event: string, handler: (...args: any[]) => void) => void
      off: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}

export interface DevToolsLogsClient {
  add: (input: DevToolsLogEntryInput) => Promise<DevToolsLogHandle>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
}

function createRpcHandle(rpc: DevToolsRpcClient, initialEntry: DevToolsLogEntry): DevToolsLogHandle {
  let current = initialEntry
  return {
    get entry() { return current },
    get id() { return current.id },
    update: async (patch) => {
      const updated = await rpc.call('devtoolskit:internal:logs:update' as any, current.id, patch)
      if (updated) current = updated
      return updated
    },
    dismiss: () => rpc.call('devtoolskit:internal:logs:remove' as any, current.id),
  }
}

export function createClientLogsClient(rpc: DevToolsRpcClient): DevToolsLogsClient {
  return {
    async add(input) {
      const entry = await rpc.call('devtoolskit:internal:logs:add' as any, input)
      return createRpcHandle(rpc, entry)
    },
    async remove(id) {
      await rpc.call('devtoolskit:internal:logs:remove' as any, id)
    },
    async clear() {
      await rpc.call('devtoolskit:internal:logs:clear' as any)
    },
  }
}

export async function getDevToolsRpcClient(options?: {
  connectionMeta?: ConnectionMeta
}): Promise<DevToolsRpcClient> {
  const meta = options?.connectionMeta ?? await fetchConnectionMeta()

  if (meta.backend === 'websocket') {
    const { createBirpc } = await import('birpc')
    const port = meta.websocket ?? location.port
    const ws = new WebSocket(`ws://${location.hostname}:${port}`)

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        const rpc = createBirpc<Record<string, any>, Record<string, any>>({}, {
          post: (data) => ws.send(data),
          on: (handler) => { ws.onmessage = (e) => handler(e.data) },
          serialize: JSON.stringify,
          deserialize: JSON.parse,
        })

        resolve({
          call: (method, ...args) => (rpc as any)[method](...args),
        })
      }
      ws.onerror = reject
    })
  }

  throw new Error(`[DevTools] Unsupported backend: ${meta.backend}`)
}

async function fetchConnectionMeta(): Promise<ConnectionMeta> {
  const response = await fetch('/.devtools/.connection.json')
  return response.json()
}

export type { DevToolsClientScriptContext as DockClientScriptContext }
