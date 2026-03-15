import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'

export function rspackListSessions(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:list-sessions',
    type: 'query',
    setup: () => ({
      handler: async () =>
        Array.from(collector.sessions.values())
          .map(s => ({ id: s.id, timestamp: s.timestamp, duration: s.duration, hash: s.hash }))
          .sort((a, b) => b.timestamp - a.timestamp),
    }),
  }
}
