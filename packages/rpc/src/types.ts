export type { BirpcFn, BirpcReturn, BirpcGroup, BirpcOptions, ChannelOptions, EventOptions } from 'birpc'

export type Thenable<T> = T | Promise<T>

/**
 * Type of the RPC function:
 * - static: Returns static data, no arguments (can be cached and dumped)
 * - action: Performs an action (no data returned)
 * - query: Queries a resource
 */
export type RpcFunctionType = 'static' | 'action' | 'query'

export interface RpcFunctionSetupResult<
  ARGS extends any[] = any[],
  RETURN = void,
> {
  handler: (...args: ARGS) => RETURN
}

export interface RpcFunctionDefinition<
  NAME extends string = string,
  TYPE extends RpcFunctionType = RpcFunctionType,
  ARGS extends any[] = any[],
  RETURN = any,
  CONTEXT = any,
> {
  name: NAME
  type: TYPE
  setup: (ctx: CONTEXT) => RpcFunctionSetupResult<ARGS, RETURN> | Promise<RpcFunctionSetupResult<ARGS, RETURN>>
}

export type RpcFunctionDefinitionAny = RpcFunctionDefinition<string, any, any, any, any>
export type RpcFunctionDefinitionAnyWithContext<CONTEXT = any> = RpcFunctionDefinition<string, any, any, any, CONTEXT>

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

export interface RpcFunctionsHost<CONTEXT = any> {
  register: (fn: RpcFunctionDefinition<string, RpcFunctionType, any[], any, CONTEXT>) => void
  broadcast: <T extends keyof DevToolsRpcClientFunctions>(
    options: RpcBroadcastOptions<T>,
  ) => Promise<void>
  sharedState: RpcSharedStateHost
  invokeLocal: <T extends keyof DevToolsRpcServerFunctions>(
    method: T,
    ...args: Parameters<DevToolsRpcServerFunctions[T]>
  ) => Promise<Awaited<ReturnType<DevToolsRpcServerFunctions[T]>>>
}
