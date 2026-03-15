import type {
  DevToolsRpcClientFunctions,
  DevToolsRpcServerFunctions,
  RpcBroadcastOptions,
  RpcFunctionDefinition as GenericRpcFunctionDefinition,
  RpcFunctionsHost as GenericRpcFunctionsHost,
  RpcFunctionType,
  RpcSharedStateHost,
} from '@rspack-devtools/rpc'
import type { DevToolsNodeContext } from './context'

export type {
  RpcFunctionType,
  RpcFunctionSetupResult,
  RpcFunctionDefinitionAny,
  RpcFunctionDefinitionAnyWithContext,
  DevToolsRpcServerFunctions,
  DevToolsRpcClientFunctions,
  DevToolsRpcSharedStates,
  RpcBroadcastOptions,
  SharedState,
  RpcSharedStateHost,
} from '@rspack-devtools/rpc'

/**
 * RpcFunctionDefinition bound to DevToolsNodeContext.
 */
export interface RpcFunctionDefinition<
  Name extends string = string,
  Handler extends (...args: any[]) => any = (...args: any[]) => any,
> {
  name: Name
  type: 'query' | 'action' | 'static'
  setup: (ctx: DevToolsNodeContext) => { handler: Handler } | Promise<{ handler: Handler }>
}

/**
 * RpcFunctionsHost bound to DevToolsNodeContext.
 */
export type RpcFunctionsHost = GenericRpcFunctionsHost<DevToolsNodeContext>
