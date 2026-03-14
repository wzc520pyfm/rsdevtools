import type { DevToolsPluginOptions } from '@rspack-devtools/kit'

declare module '@rspack/core' {
  interface RspackPluginInstance {
    devtools?: DevToolsPluginOptions
  }
}
