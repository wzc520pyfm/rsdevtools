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
 *
 * @example With built-in devtools disabled (for custom plugins only)
 * ```ts
 * import { RspackDevTools } from '@rspack-devtools/core'
 *
 * export default {
 *   plugins: [
 *     RspackDevTools({ builtinDevTools: false }),
 *   ],
 * }
 * ```
 */
export function RspackDevTools(options: RspackDevToolsOptions = {}): RspackDevToolsPlugin {
  return new RspackDevToolsPlugin(options)
}
