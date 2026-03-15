import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetPackages(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-packages',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        return s?.packages ?? []
      },
    }),
  }
}
