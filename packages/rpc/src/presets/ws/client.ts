import type { BirpcOptions } from 'birpc'

export interface WsClientPresetOptions {
  url: string
  protocols?: string | string[]
  onOpen?: (ws: WebSocket) => void
  onClose?: (ws: WebSocket) => void
  onError?: (ws: WebSocket, error: Event) => void
}

export function defineWsClientPreset<
  ServerFunctions extends object = Record<string, never>,
  ClientFunctions extends object = Record<string, never>,
>(
  options: WsClientPresetOptions,
): {
  preset: BirpcOptions<ServerFunctions, ClientFunctions>
  ws: Promise<WebSocket>
} {
  let resolveWs: (ws: WebSocket) => void
  const wsPromise = new Promise<WebSocket>((resolve) => {
    resolveWs = resolve
  })

  const ws = new WebSocket(options.url, options.protocols)

  ws.addEventListener('open', () => {
    options.onOpen?.(ws)
    resolveWs(ws)
  })
  ws.addEventListener('close', () => options.onClose?.(ws))
  ws.addEventListener('error', e => options.onError?.(ws, e))

  return {
    preset: {
      post: (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data)
      },
      on: (handler) => {
        ws.addEventListener('message', e => handler(e.data))
      },
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    } as BirpcOptions<ServerFunctions, ClientFunctions>,
    ws: wsPromise,
  }
}
