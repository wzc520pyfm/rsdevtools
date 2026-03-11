import type { DataCollector } from './collector'
import type { ServerFunctions } from './types'

export function createRpcFunctions(collector: DataCollector): ServerFunctions {
  return {
    'rspack:list-sessions': async () => {
      return Array.from(collector.sessions.values())
        .map(s => ({
          id: s.id,
          timestamp: s.timestamp,
          duration: s.duration,
          hash: s.hash,
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
    },

    'rspack:get-session': async ({ session }) => {
      return collector.sessions.get(session) ?? null
    },

    'rspack:get-modules': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.modules ?? []
    },

    'rspack:get-module-info': async ({ session, module: moduleId }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.modules.find(m => m.id === moduleId) ?? null
    },

    'rspack:get-chunks': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.chunks ?? []
    },

    'rspack:get-chunk-info': async ({ session, chunk }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.chunks.find(c => c.id === chunk) ?? null
    },

    'rspack:get-assets': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.assets ?? []
    },

    'rspack:get-entrypoints': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.entrypoints ?? []
    },

    'rspack:get-errors': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.errors ?? []
    },

    'rspack:get-warnings': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.warnings ?? []
    },

    'rspack:get-module-graph': async ({ session }) => {
      const s = collector.sessions.get(session)
      if (!s) return { nodes: [], edges: [] }
      return collector.buildModuleGraph(s)
    },
  }
}
