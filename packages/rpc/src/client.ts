import type { BirpcOptions, BirpcReturn } from 'birpc'
import { createBirpc } from 'birpc'

export function createRpcClient<
  ServerFunctions extends object = Record<string, never>,
  ClientFunctions extends object = Record<string, never>,
>(
  functions: ClientFunctions,
  options: {
    preset: BirpcOptions<ServerFunctions, ClientFunctions>
    rpcOptions?: Partial<BirpcOptions<ServerFunctions, ClientFunctions>>
  },
): BirpcReturn<ServerFunctions, ClientFunctions> {
  const { preset, rpcOptions = {} } = options
  return createBirpc<ServerFunctions, ClientFunctions>(functions, {
    ...preset,
    timeout: -1,
    ...rpcOptions,
  })
}
