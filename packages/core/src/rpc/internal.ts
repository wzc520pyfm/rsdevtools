import type { DevToolsLogEntryInput, RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DevToolsLogsHost } from '../hosts/logs-host'

/**
 * Internal RPC functions for logs, docks, and launchers.
 * These stay in core as they are fundamental to the devtools infrastructure.
 */
export function internalRpcDeclarations(): RpcFunctionDefinition[] {
  return [
    {
      name: 'devtoolskit:internal:logs:list',
      type: 'query',
      setup: (ctx) => ({
        handler: async (since?: number) => {
          const host = ctx.logs as DevToolsLogsHost
          return host.list(since)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:add',
      type: 'action',
      setup: (ctx) => ({
        handler: async (input: DevToolsLogEntryInput) => {
          const handle = await ctx.logs.add({ ...input, from: input.from ?? 'browser' })
          return handle.entry
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:update',
      type: 'action',
      setup: (ctx) => ({
        handler: async (id: string, patch: Partial<DevToolsLogEntryInput>) => {
          return ctx.logs.update(id, patch)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:remove',
      type: 'action',
      setup: (ctx) => ({
        handler: async (id: string) => {
          await ctx.logs.remove(id)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:clear',
      type: 'action',
      setup: (ctx) => ({
        handler: async () => {
          await ctx.logs.clear()
        },
      }),
    },
    {
      name: 'devtoolskit:internal:docks:on-launch',
      type: 'action',
      setup: (ctx) => ({
        handler: async (dockId: string) => {
          const entry = ctx.docks.values({ includeBuiltin: false })
            .find(e => e.id === dockId)
          if (!entry || entry.type !== 'launcher') {
            throw new Error(`Dock "${dockId}" is not a launcher entry`)
          }
          const launcher = entry.launcher
          try {
            ctx.docks.update({ ...entry, launcher: { ...launcher, status: 'loading' } } as any)
            await launcher.onLaunch()
            ctx.docks.update({ ...entry, launcher: { ...launcher, status: 'success' } } as any)
          }
          catch (err: any) {
            ctx.docks.update({
              ...entry,
              launcher: { ...launcher, status: 'error', error: err?.message ?? String(err) },
            } as any)
            throw err
          }
        },
      }),
    },
    {
      name: 'rspack:get-docks',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => ctx.docks.values({ includeBuiltin: false }),
      }),
    },
    {
      name: 'devtoolskit:internal:terminals:list',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => ctx.terminals.list(),
      }),
    },
    {
      name: 'devtoolskit:internal:terminals:read',
      type: 'query',
      setup: (ctx) => ({
        handler: async (id: string) => {
          const session = ctx.terminals.sessions.get(id)
          return session?.buffer ?? ''
        },
      }),
    },
  ]
}
