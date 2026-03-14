import type { DevToolsNodeContext } from './context'

export interface RpcFunctionDefinition<
  Name extends string = string,
  Handler extends (...args: any[]) => any = (...args: any[]) => any,
> {
  name: Name
  type: 'query' | 'action' | 'static'
  setup: (ctx: DevToolsNodeContext) => { handler: Handler } | Promise<{ handler: Handler }>
}

export interface RpcBroadcastOptions<
  T extends keyof DevToolsRpcClientFunctions = keyof DevToolsRpcClientFunctions,
  Args extends Parameters<DevToolsRpcClientFunctions[T]> = Parameters<DevToolsRpcClientFunctions[T]>,
> {
  method: T
  args: Args
  filter?: (client: any) => boolean
}

export interface SharedState<T> {
  value: () => T
  mutate: (updater: (draft: T) => T | void) => void
  patch: (partial: Partial<T>) => void
  on: (event: 'updated', handler: (value: T) => void) => void
}

export interface RpcSharedStateHost {
  get<K extends string, V>(
    key: K,
    options?: { initialValue?: V; sharedState?: SharedState<V> },
  ): Promise<SharedState<V>>
}

export interface RpcFunctionsHost {
  register: (fn: RpcFunctionDefinition) => void
  broadcast: <T extends keyof DevToolsRpcClientFunctions>(
    options: RpcBroadcastOptions<T>,
  ) => Promise<void>
  sharedState: RpcSharedStateHost
  invokeLocal: <T extends keyof DevToolsRpcServerFunctions>(
    method: T,
    ...args: Parameters<DevToolsRpcServerFunctions[T]>
  ) => Promise<Awaited<ReturnType<DevToolsRpcServerFunctions[T]>>>
}

/**
 * Server-side RPC functions that clients can call.
 * Extend this interface via module augmentation to add custom functions.
 */
export interface DevToolsRpcServerFunctions {
  [key: string]: (...args: any[]) => any
}

/**
 * Client-side RPC functions that server can call (broadcast).
 * Extend this interface via module augmentation to add custom functions.
 */
export interface DevToolsRpcClientFunctions {
  [key: string]: (...args: any[]) => any
}

/**
 * Shared state keys and their types.
 * Extend this interface via module augmentation to add custom shared state.
 */
export interface DevToolsRpcSharedStates {
  [key: string]: any
}
