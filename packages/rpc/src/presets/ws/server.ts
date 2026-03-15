import type { BirpcGroup, ChannelOptions } from 'birpc'
import type { WebSocket, WebSocketServer } from 'ws'

export interface WsServerPresetOptions {
  wss: WebSocketServer
  onConnection?: (ws: WebSocket) => void
  onClose?: (ws: WebSocket) => void
  onError?: (ws: WebSocket, error: Error) => void
}

export function defineWsServerPreset<
  ClientFunctions extends object = Record<string, never>,
  ServerFunctions extends object = Record<string, never>,
>(
  options: WsServerPresetOptions,
): (rpc: BirpcGroup<ClientFunctions, ServerFunctions>) => void {
  return (rpc) => {
    options.wss.on('connection', (ws: WebSocket) => {
      options.onConnection?.(ws)
      rpc.updateChannels((channels: ChannelOptions[]) => {
        channels.push({
          post: (data) => {
            if (ws.readyState === ws.OPEN) ws.send(data)
          },
          on: (handler) => {
            ws.on('message', (data: any) => handler(data.toString()))
          },
          serialize: JSON.stringify,
          deserialize: JSON.parse,
        })
      })

      ws.on('close', () => {
        options.onClose?.(ws)
      })
      ws.on('error', (error) => {
        options.onError?.(ws, error)
      })
    })
  }
}
