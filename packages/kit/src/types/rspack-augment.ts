import type { DevToolsPluginOptions } from './context'

export interface RspackPluginWithDevTools {
  name?: string
  devtools?: DevToolsPluginOptions
  apply: (compiler: any) => void
}
