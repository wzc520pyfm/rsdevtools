import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'
import { DataCollector } from './collector'
import { rspackBuildRpcDeclarations } from './rpc'
import { clientPublicDir } from '../dirs'

export interface DevToolsRspackUIOptions {
  collector?: DataCollector
}

const BASE_URL = '/.devtools-rspack/'

export function DevToolsRspackUI(options: DevToolsRspackUIOptions = {}): { devtools: DevToolsPluginOptions } & { name: string } {
  const collector = options.collector ?? new DataCollector()

  return {
    name: 'rspack-devtools-rspack-ui',
    devtools: {
      setup: async (ctx: DevToolsNodeContext) => {
        collector.setCwd(ctx.cwd)

        ctx.views.hostStatic(BASE_URL, clientPublicDir)

        ctx.docks.register({
          type: 'iframe',
          id: 'rspack-build',
          title: 'Build Analysis',
          icon: 'ph:lightning-duotone',
          category: '~rspackplus',
          url: BASE_URL,
        })

        for (const fn of rspackBuildRpcDeclarations(collector, ctx.terminals)) {
          ctx.rpc.register(fn)
        }
      },
    },
  }
}

export { DataCollector }
