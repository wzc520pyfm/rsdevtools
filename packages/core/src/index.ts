export { RspackDevToolsPlugin } from './plugin'
export { RspackDevTools } from './factory'
export { startDevToolsServer } from './server'
export { createDevToolsContext } from './context'
export { getInjectClientScript, getInjectScript } from './inject'

export { DevToolsDockHost } from './hosts/dock-host'
export { RpcFunctionsHost } from './hosts/rpc-host'
export { DevToolsViewHost } from './hosts/view-host'
export { DevToolsLogsHost } from './hosts/logs-host'
export { DevToolsTerminalHost } from './hosts/terminal-host'

export type {
  ConnectionMeta,
  RspackDevToolsOptions,
} from './types'

export type { LauncherConfig } from '@rspack-devtools/rspack'
export { DEFAULT_RSPACK_DEV_LAUNCHER } from '@rspack-devtools/rspack'

// Re-export from @rspack-devtools/rspack for convenience
export { DataCollector } from '@rspack-devtools/rspack'
export type {
  AssetData,
  AssetInfo,
  BuildError,
  BuildSession,
  BuildWarning,
  ChunkData,
  ChunkOrigin,
  CompareMetric,
  EntrypointData,
  GraphEdge,
  GraphNode,
  ModuleData,
  ModuleReason,
  PackageData,
  PackageInstance,
  PluginData,
  SessionComparison,
} from '@rspack-devtools/rspack'
