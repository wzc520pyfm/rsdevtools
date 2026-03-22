/**
 * Namespaced debug loggers (obug / DEBUG), aligned with vite-devtools:
 * - vite: `vite:devtools:*`
 * - rspack: `rspack:devtools:*`
 *
 * Enable: `DEBUG=rspack:devtools:*` or `DEBUG=rspack:devtools:rpc:*` etc.
 */
import { createDebug } from 'obug'

export const debugContextSetup = createDebug('rspack:devtools:context:setup')
export const debugRpcBroadcast = createDebug('rspack:devtools:rpc:broadcast')
export const debugRpcStateChanged = createDebug('rspack:devtools:rpc:state:changed')
export const debugRpcInvoked = createDebug('rspack:devtools:rpc:invoked')

let syncSeq = 0
export function nextRspackDevtoolsSyncId(): string {
  return `rdt-${++syncSeq}-${Date.now().toString(36)}`
}
