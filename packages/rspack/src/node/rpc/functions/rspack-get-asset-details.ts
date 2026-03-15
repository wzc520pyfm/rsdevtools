import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetAssetDetails(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-asset-details',
    type: 'query',
    setup: () => ({
      handler: async ({ session, asset }: { session: string; asset: string }) => {
        const s = collector.sessions.get(session)
        if (!s) return null
        return s.assets.find(a => a.name === asset) ?? null
      },
    }),
  }
}
