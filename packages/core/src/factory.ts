import type { RspackDevToolsOptions } from './types'
import { RspackDevToolsPlugin } from './plugin'

/**
 * Function-style factory for creating RspackDevToolsPlugin.
 * Consistent with vite-devtools' `DevTools()` API.
 *
 * @example
 * ```ts
 * import { RspackDevTools } from '@rspack-devtools/core'
 *
 * export default {
 *   plugins: [
 *     RspackDevTools(),
 *   ],
 * }
 * ```
 */
export function RspackDevTools(options: RspackDevToolsOptions = {}): RspackDevToolsPlugin {
  return new RspackDevToolsPlugin(options)
}
