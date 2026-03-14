import type {
  DevToolsNodeContext,
  DevToolsRpcClientFunctions,
  DevToolsRpcServerFunctions,
  RpcBroadcastOptions,
  RpcFunctionDefinition,
  RpcFunctionsHost as RpcFunctionsHostType,
  RpcSharedStateHost,
  SharedState,
} from '@rspack-devtools/kit'

export class RpcFunctionsHost implements RpcFunctionsHostType {
  private definitions = new Map<string, RpcFunctionDefinition>()
  private handlers = new Map<string, (...args: any[]) => any>()
  private _broadcastFn?: (options: RpcBroadcastOptions) => Promise<void>
  sharedState: RpcSharedStateHost

  constructor(private context: DevToolsNodeContext) {
    this.sharedState = new SimpleSharedStateHost()
  }

  register(fn: RpcFunctionDefinition): void {
    if (this.definitions.has(fn.name)) {
      console.warn(`[DevTools] RPC function "${fn.name}" is already registered, overwriting.`)
    }
    this.definitions.set(fn.name, fn)
  }

  async getHandler(name: string): Promise<((...args: any[]) => any) | undefined> {
    if (this.handlers.has(name)) {
      return this.handlers.get(name)
    }

    const definition = this.definitions.get(name)
    if (!definition) return undefined

    const result = await definition.setup(this.context)
    this.handlers.set(name, result.handler)
    return result.handler
  }

  async resolveAllHandlers(): Promise<Record<string, (...args: any[]) => any>> {
    const handlers: Record<string, (...args: any[]) => any> = {}
    for (const [name] of this.definitions) {
      const handler = await this.getHandler(name)
      if (handler) {
        handlers[name] = handler
      }
    }
    return handlers
  }

  async invokeLocal<
    T extends keyof DevToolsRpcServerFunctions,
  >(
    method: T,
    ...args: Parameters<DevToolsRpcServerFunctions[T]>
  ): Promise<Awaited<ReturnType<DevToolsRpcServerFunctions[T]>>> {
    const handler = await this.getHandler(method as string)
    if (!handler) {
      throw new Error(`RPC function "${String(method)}" is not registered`)
    }
    return await Promise.resolve(handler(...args))
  }

  async broadcast<
    T extends keyof DevToolsRpcClientFunctions,
  >(options: RpcBroadcastOptions<T>): Promise<void> {
    if (this._broadcastFn) {
      await this._broadcastFn(options as RpcBroadcastOptions)
    }
  }

  /** @internal - Set by server after WebSocket setup */
  _setBroadcast(fn: (options: RpcBroadcastOptions) => Promise<void>): void {
    this._broadcastFn = fn
  }

  getDefinitions(): Map<string, RpcFunctionDefinition> {
    return this.definitions
  }
}

class SimpleSharedStateHost implements RpcSharedStateHost {
  private states = new Map<string, SharedState<any>>()

  async get<K extends string, V>(
    key: K,
    options?: { initialValue?: V; sharedState?: SharedState<V> },
  ): Promise<SharedState<V>> {
    if (this.states.has(key)) {
      return this.states.get(key)!
    }

    if (options?.sharedState) {
      this.states.set(key, options.sharedState)
      return options.sharedState
    }

    const listeners = new Set<(value: V) => void>()
    let value = options?.initialValue as V

    const state: SharedState<V> = {
      value: () => value,
      mutate: (updater) => {
        const result = updater(value)
        if (result !== undefined) {
          value = result
        }
        listeners.forEach((fn) => fn(value))
      },
      patch: (partial) => {
        value = { ...value, ...partial }
        listeners.forEach((fn) => fn(value))
      },
      on: (event, handler) => {
        if (event === 'updated') {
          listeners.add(handler)
        }
      },
    }

    this.states.set(key, state)
    return state
  }
}
