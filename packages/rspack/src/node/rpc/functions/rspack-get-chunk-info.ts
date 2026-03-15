import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackGetChunkInfo(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:get-chunk-info',
    type: 'query',
    setup: () => ({
      handler: async ({ session, chunk }: { session: string; chunk: string }) => {
        const s = collector.sessions.get(session)
        if (!s) return null
        return s.chunks.find(c => c.id === chunk) ?? null
      },
    }),
  }
}
