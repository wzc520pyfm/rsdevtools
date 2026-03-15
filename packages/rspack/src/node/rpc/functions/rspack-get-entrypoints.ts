import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetEntrypoints(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-entrypoints',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        return s?.entrypoints ?? []
      },
    }),
  }
}
