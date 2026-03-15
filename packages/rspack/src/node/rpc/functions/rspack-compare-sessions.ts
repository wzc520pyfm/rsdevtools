import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from '../../collector'
import type { SessionComparison } from '../../../shared/types'

export function rspackCompareSessions(collector: DataCollector): RpcFunctionDefinition {
  return {
    name: 'rspack:compare-sessions',
    type: 'query',
    setup: () => ({
      handler: async ({ sessions: sessionIds }: { sessions: string[] }) => {
        const sessionData = sessionIds
          .map(id => collector.sessions.get(id))
          .filter(Boolean) as any[]
        if (sessionData.length < 2) return null

        const comparison: SessionComparison = {
          sessions: sessionData.map((s: any) => ({
            id: s.id,
            timestamp: s.timestamp,
            duration: s.duration,
          })),
          metrics: [
            { label: 'Build Duration', values: sessionData.map((s: any) => s.duration), unit: 'ms', type: 'duration' },
            { label: 'Total Modules', values: sessionData.map((s: any) => s.modules.length), unit: '', type: 'count' },
            { label: 'Total Chunks', values: sessionData.map((s: any) => s.chunks.length), unit: '', type: 'count' },
            { label: 'Total Assets', values: sessionData.map((s: any) => s.assets.length), unit: '', type: 'count' },
            { label: 'Bundle Size', values: sessionData.map((s: any) => s.assets.reduce((sum: number, a: any) => sum + a.size, 0)), unit: 'bytes', type: 'size' },
            { label: 'Errors', values: sessionData.map((s: any) => s.errors.length), unit: '', type: 'count' },
            { label: 'Warnings', values: sessionData.map((s: any) => s.warnings.length), unit: '', type: 'count' },
            { label: 'Plugins', values: sessionData.map((s: any) => s.plugins.length), unit: '', type: 'count' },
            { label: 'Packages', values: sessionData.map((s: any) => s.packages.length), unit: '', type: 'count' },
            { label: 'Duplicate Packages', values: sessionData.map((s: any) => s.packages.filter((p: any) => p.isDuplicate).length), unit: '', type: 'count' },
            {
              label: 'Initial JS Size',
              values: sessionData.map((s: any) =>
                s.assets
                  .filter((a: any) => a.name.endsWith('.js') && s.chunks.some((c: any) => c.initial && c.files.includes(a.name)))
                  .reduce((sum: number, a: any) => sum + a.size, 0),
              ),
              unit: 'bytes',
              type: 'size',
            },
          ],
        }
        return comparison
      },
    }),
  }
}
