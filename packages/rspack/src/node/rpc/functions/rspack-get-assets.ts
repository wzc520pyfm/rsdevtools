import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetAssets(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-assets',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) => {
        const s = collector.sessions.get(session)
        return s?.assets ?? []
      },
    }),
  }
}
