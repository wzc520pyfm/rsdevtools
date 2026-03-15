import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetModuleInfo(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-module-info',
    type: 'query',
    setup: () => ({
      handler: async ({ session, module: moduleId }: { session: string; module: string }) => {
        const s = collector.sessions.get(session)
        if (!s) return null
        return s.modules.find(m => m.id === moduleId) ?? null
      },
    }),
  }
}
