import type { RpcFunctionDefinition } from '@rspack-devtools/kit'

export function selfInspectRpcDeclarations(): RpcFunctionDefinition[] {
  return [
    {
      name: 'devtoolskit:self-inspect:get-docks',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => ctx.docks.values(),
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-rpc-functions',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => {
          const host = ctx.rpc as any
          const defs = host.getDefinitions?.() as Map<string, RpcFunctionDefinition> | undefined
          if (!defs) return []
          return Array.from(defs.values()).map(d => ({
            name: d.name,
            type: d.type,
          }))
        },
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-client-scripts',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => {
          const entries = ctx.docks.values({ includeBuiltin: false })
          const scripts: Array<{ dockId: string; dockTitle: string; type: string; importFrom?: string; importName?: string }> = []
          for (const entry of entries) {
            if (entry.type === 'action' && 'action' in entry) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'action',
                importFrom: entry.action.importFrom,
                importName: entry.action.importName,
              })
            }
            else if (entry.type === 'custom-render' && 'renderer' in entry) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'custom-render',
                importFrom: entry.renderer.importFrom,
                importName: entry.renderer.importName,
              })
            }
            else if (entry.type === 'iframe' && 'clientScript' in entry && entry.clientScript) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'iframe',
                importFrom: entry.clientScript.importFrom,
                importName: entry.clientScript.importName,
              })
            }
          }
          return scripts
        },
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-devtools-plugins',
      type: 'query',
      setup: () => ({
        handler: async () => {
          return [] as Array<{ name: string; hasDevtools: boolean }>
        },
      }),
    },
  ]
}
