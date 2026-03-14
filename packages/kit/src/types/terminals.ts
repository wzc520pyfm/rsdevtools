import type { EventEmitter } from './events'

export interface TerminalSession {
  id: string
  name: string
  command: string
  cwd: string
  status: 'running' | 'exited'
  exitCode?: number
  buffer: string
  startTime: number
  endTime?: number
}

export interface DevToolsTerminalHost {
  readonly sessions: Map<string, TerminalSession>
  readonly events: EventEmitter<{
    'terminal:session:updated': () => void
    'terminal:session:stream-chunk': (data: { id: string; data: string }) => void
  }>
  run: (command: string, cwd?: string, name?: string) => string
  list: () => TerminalSession[]
}
