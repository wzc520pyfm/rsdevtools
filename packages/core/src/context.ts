import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'
import type { RspackDevToolsOptions } from './types'
import { DevToolsDockHost } from './hosts/dock-host'
import { DevToolsLogsHost } from './hosts/logs-host'
import { RpcFunctionsHost } from './hosts/rpc-host'
import { DevToolsTerminalHost } from './hosts/terminal-host'
import { DevToolsViewHost } from './hosts/view-host'
import { internalRpcDeclarations } from './rpc/internal'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function shouldSkipSetupByCapabilities(
  plugin: { devtools?: DevToolsPluginOptions },
  mode: 'dev' | 'build',
): boolean {
  const modeCapabilities = plugin.devtools?.capabilities?.[mode]
  if (modeCapabilities === false) return true
  if (!isObject(modeCapabilities)) return false
  return Object.values(modeCapabilities).includes(false)
}

export interface CreateContextOptions {
  cwd: string
  plugins: any[]
  options: RspackDevToolsOptions
}

export async function createDevToolsContext(
  opts: CreateContextOptions,
): Promise<DevToolsNodeContext> {
  const { cwd, plugins } = opts

  const context: DevToolsNodeContext = {
    cwd,
    workspaceRoot: cwd,
    mode: 'dev',
    rpc: undefined!,
    docks: undefined!,
    views: undefined!,
    terminals: undefined!,
    logs: undefined!,
  }

  const rpcHost = new RpcFunctionsHost(context)
  const docksHost = new DevToolsDockHost(context)
  const viewsHost = new DevToolsViewHost()
  const terminalsHost = new DevToolsTerminalHost()
  const logsHost = new DevToolsLogsHost()

  context.rpc = rpcHost
  context.docks = docksHost
  context.views = viewsHost
  context.terminals = terminalsHost
  context.logs = logsHost

  for (const fn of internalRpcDeclarations()) {
    rpcHost.register(fn)
  }

  const docksSharedState = await rpcHost.sharedState.get('devtoolskit:internal:docks', {
    initialValue: [] as any[],
  })

  const _defaultSettings = {
    docksHidden: [] as string[],
    docksCategoriesHidden: [] as string[],
    docksPinned: [] as string[],
    docksCustomOrder: [] as string[],
    showIframeAddressBar: false,
    closeOnOutsideClick: false,
  }
  await rpcHost.sharedState.get('devtoolskit:internal:user-settings', {
    initialValue: _defaultSettings,
  })

  docksHost.events.on('dock:entry:updated', () => {
    docksSharedState.mutate(() => context.docks.values())
  })

  terminalsHost.events.on('terminal:session:updated', () => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:terminals:updated',
      args: [],
    })
    docksSharedState.mutate(() => context.docks.values())
  })

  terminalsHost.events.on('terminal:session:stream-chunk', (data) => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:terminals:stream-chunk',
      args: [data],
    })
  })

  logsHost.events.on('log:added', () => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:logs:updated',
      args: [],
    })
    docksSharedState.mutate(() => context.docks.values())
  })
  logsHost.events.on('log:updated', () => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:logs:updated',
      args: [],
    })
  })
  logsHost.events.on('log:removed', () => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:logs:updated',
      args: [],
    })
  })
  logsHost.events.on('log:cleared', () => {
    rpcHost.broadcast({
      method: 'devtoolskit:internal:logs:updated',
      args: [],
    })
    docksSharedState.mutate(() => context.docks.values())
  })

  // Discover and setup plugins with devtools
  const devtoolsPlugins = plugins.filter(
    (plugin: any) => plugin && typeof plugin === 'object' && 'devtools' in plugin,
  )

  for (const plugin of devtoolsPlugins) {
    if (!plugin.devtools?.setup) continue
    if (shouldSkipSetupByCapabilities(plugin, context.mode)) {
      console.log(`[Rspack DevTools] Skipping plugin "${plugin.name ?? plugin.constructor?.name}" (disabled for ${context.mode} mode)`)
      continue
    }
    try {
      const pluginName = plugin.name ?? plugin.constructor?.name ?? 'unknown'
      console.log(`[Rspack DevTools] Setting up plugin: ${pluginName}`)
      await plugin.devtools.setup(context)
    }
    catch (error) {
      const pluginName = plugin.name ?? plugin.constructor?.name ?? 'unknown'
      console.error(`[Rspack DevTools] Error setting up plugin ${pluginName}:`, error)
    }
  }

  return context
}
