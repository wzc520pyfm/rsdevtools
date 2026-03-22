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
          const formatErr = (err: unknown) =>
            err instanceof Error
              ? err.message
              : typeof err === 'object' && err !== null && 'message' in err
                ? String((err as { message: unknown }).message)
                : String(err)
          try {
            ctx.docks.update({ ...entry, launcher: { ...launcher, status: 'loading' } } as any)
            await launcher.onLaunch()
            const latest = ctx.docks.values({ includeBuiltin: false }).find(e => e.id === dockId)
            if (latest?.type === 'launcher') {
              ctx.docks.update({
                ...latest,
                launcher: { ...latest.launcher, status: 'success' },
              } as any)
            }
          }
          catch (err: unknown) {
            const latest = ctx.docks.values({ includeBuiltin: false }).find(e => e.id === dockId)
            if (latest?.type === 'launcher') {
              ctx.docks.update({
                ...latest,
                launcher: {
                  ...latest.launcher,
                  status: 'error',
                  error: formatErr(err),
                },
              } as any)
            }
            throw err instanceof Error ? err : new Error(formatErr(err))
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
