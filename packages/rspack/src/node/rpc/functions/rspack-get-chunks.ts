import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetChunks(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-chunks',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        return s?.chunks ?? []
      },
    }),
  }
}
