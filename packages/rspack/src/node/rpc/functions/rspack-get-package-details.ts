import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetPackageDetails(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-package-details',
    type: 'query',
    setup: () => ({
      handler: async ({ session, name }: { session: string; name: string }) => {
        const s = collector.sessions.get(session)
        if (!s) return null
        return s.packages.find(p => p.name === name) ?? null
      },
    }),
  }
}
