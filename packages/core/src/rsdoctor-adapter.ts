import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'

const RSDOCTOR_DOCK_ICON = 'https://assets.rspack.rs/rsdoctor/rsdoctor-logo-480x480.png'

export interface RsdoctorAdapterOptions {
  /**
   * The rsdoctor plugin instance (already applied to the compiler).
   * Used to retrieve the server URL after bootstrap.
   */
  rsdoctorPlugin: any
}

/**
 * rs-devtools adapter that embeds rsdoctor's UI as an iframe dock.
 *
 * The rsdoctor plugin must already be `apply()`'d to the compiler
 * so that its hooks fire during compilation. This adapter only
 * registers the iframe dock pointing at rsdoctor's server.
 */
export function DevToolsRsdoctorUI(
  options: RsdoctorAdapterOptions,
): { name: string; devtools: DevToolsPluginOptions } {
  const { rsdoctorPlugin } = options

  return {
    name: 'rsdoctor-devtools-ui',
    devtools: {
      setup: async (ctx: DevToolsNodeContext) => {
        await rsdoctorPlugin._bootstrapTask

        const port = rsdoctorPlugin.sdk.server.port
        const url = `http://localhost:${port}`

        ctx.docks.register({
          type: 'iframe',
          id: 'rsdoctor',
          title: 'Rsdoctor',
          icon: RSDOCTOR_DOCK_ICON,
          category: '~rspackplus',
          url,
        })

        ctx.logs.add({
          from: 'rsdoctor',
          category: 'info',
          label: 'server',
          message: `Rsdoctor server running at ${url}`,
        })
      },
    },
  }
}
