import type { RpcFunctionDefinition, RpcFunctionType } from './types'

export function defineRpcFunction<
  NAME extends string,
  TYPE extends RpcFunctionType,
  ARGS extends any[],
  RETURN = void,
  CONTEXT = undefined,
>(
  definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, CONTEXT>,
): RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, CONTEXT> {
  return definition
}

export function createDefineWrapperWithContext<CONTEXT>() {
  return function defineRpcFunctionWithContext<
    NAME extends string,
    TYPE extends RpcFunctionType,
    ARGS extends any[],
    RETURN = void,
  >(
    definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, CONTEXT>,
  ): RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, CONTEXT> {
    return definition
  }
}
