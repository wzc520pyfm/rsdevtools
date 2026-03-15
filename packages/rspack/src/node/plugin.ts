import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'
import { DataCollector } from './collector'
import { rspackBuildRpcDeclarations } from './rpc'
import { clientPublicDir } from '../dirs'

export interface DevToolsRspackUIOptions {
  /** Override the base URL. Defaults to empty string (served from root). */
  clientBaseUrl?: string
  /** Share an existing DataCollector instead of creating a new one. */
  collector?: DataCollector
}

/**
 * The rspack client is the main DevTools client app. It's served from the root
 * by core's server (clientDir). Plugin docks use root-relative URLs.
 */
export function DevToolsRspackUI(options: DevToolsRspackUIOptions = {}): { devtools: DevToolsPluginOptions } & { name: string } {
  const collector = options.collector ?? new DataCollector()

  return {
    name: 'rspack-devtools-rspack-ui',
    devtools: {
      setup: async (ctx: DevToolsNodeContext) => {
        collector.setCwd(ctx.cwd)
        const baseUrl = options.clientBaseUrl ?? ''

        ctx.docks.register({
          type: 'iframe',
          id: 'rspack-build',
          title: 'Build Analysis',
          icon: 'ph:lightning-duotone',
          category: '~rspackplus',
          url: baseUrl || '/',
        })

        ctx.docks.register({
          type: 'iframe',
          id: 'rspack-explorer',
          title: 'File Explorer',
          icon: 'ph:folder-open-duotone',
          category: '~rspackplus',
          url: `${baseUrl}/dock/explorer`,
        })

        ctx.docks.register({
          type: 'iframe',
          id: 'rspack-terminal',
          title: 'Terminal',
          icon: 'ph:terminal-duotone',
          category: '~rspackplus',
          url: `${baseUrl}/dock/terminal`,
        })

        for (const fn of rspackBuildRpcDeclarations(collector, ctx.terminals)) {
          ctx.rpc.register(fn)
        }
      },
    },
  }
}

export { DataCollector }
export { clientPublicDir }
