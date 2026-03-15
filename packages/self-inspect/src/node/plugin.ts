import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'
import { selfInspectRpcDeclarations } from './rpc'

export interface DevToolsSelfInspectOptions {
  clientBaseUrl?: string
}

export function DevToolsSelfInspect(options: DevToolsSelfInspectOptions = {}): { devtools: DevToolsPluginOptions } & { name: string } {
  return {
    name: 'rspack-devtools-self-inspect',
    devtools: {
      setup: async (ctx: DevToolsNodeContext) => {
        const baseUrl = options.clientBaseUrl ?? ''

        ctx.docks.register({
          type: 'iframe',
          id: '~self-inspect',
          title: 'Self Inspect',
          icon: 'ph:stethoscope-duotone',
          category: '~builtin',
          url: `${baseUrl}/dock/self-inspect`,
        })

        for (const fn of selfInspectRpcDeclarations()) {
          ctx.rpc.register(fn)
        }
      },
    },
  }
}
