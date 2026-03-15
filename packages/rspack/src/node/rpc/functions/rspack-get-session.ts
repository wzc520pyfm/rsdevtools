import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetSession(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-session',
    type: 'query',
    setup: () => ({
      handler: async ({ session }: { session: string }) =>
        collector.sessions.get(session) ?? null,
    }),
  }
}
