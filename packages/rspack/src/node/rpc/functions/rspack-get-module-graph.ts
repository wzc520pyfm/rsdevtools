import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetModuleGraph(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-module-graph',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        if (!s) return { nodes: [], edges: [] }
        return collector.buildModuleGraph(s)
      },
    }),
  }
}
