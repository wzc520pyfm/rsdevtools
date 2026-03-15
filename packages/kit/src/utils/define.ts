import type { DevToolsNodeContext } from '../types/context'
import { createDefineWrapperWithContext } from '@rspack-devtools/rpc'

/**
 * Define an RPC function with DevToolsNodeContext as the setup context.
 * This is a convenience wrapper around the generic defineRpcFunction from @rspack-devtools/rpc.
 */
export const defineRpcFunction = createDefineWrapperWithContext<DevToolsNodeContext>()
