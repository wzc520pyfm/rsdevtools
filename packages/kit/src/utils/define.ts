import type { DevToolsNodeContext } from '../types/context'
import type { RpcFunctionDefinition } from '../types/rpc'

export function defineRpcFunction<
  Name extends string,
  Handler extends (...args: any[]) => any,
>(definition: {
  name: Name
  type: 'query' | 'action' | 'static'
  setup: (ctx: DevToolsNodeContext) => { handler: Handler } | Promise<{ handler: Handler }>
}): RpcFunctionDefinition<Name, Handler> {
  return definition
}
