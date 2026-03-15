import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetWarnings(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-warnings',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        return s?.warnings ?? []
      },
    }),
  }
}
