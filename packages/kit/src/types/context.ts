import type { DevToolsDockHost } from './docks'
import type { DevToolsLogsHost } from './logs'
import type { RpcFunctionsHost } from './rpc'
import type { DevToolsTerminalHost } from './terminals'
import type { DevToolsViewHost } from './views'

export interface DevToolsCapabilities {
  rpc?: boolean
  views?: boolean
}

export interface DevToolsPluginOptions {
  capabilities?: {
    dev?: DevToolsCapabilities | boolean
    build?: DevToolsCapabilities | boolean
  }
  setup: (context: DevToolsNodeContext) => void | Promise<void>
}

export interface DevToolsNodeContext {
  readonly workspaceRoot: string
  readonly cwd: string
  readonly mode: 'dev' | 'build'
  rpc: RpcFunctionsHost
  docks: DevToolsDockHost
  views: DevToolsViewHost
  terminals: DevToolsTerminalHost
  logs: DevToolsLogsHost
}

export interface ConnectionMeta {
  backend: 'websocket' | 'static'
  websocket?: number | string
}
