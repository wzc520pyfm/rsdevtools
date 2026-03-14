import type {
  DevToolsTerminalHost as DevToolsTerminalHostType,
  EventEmitter,
  TerminalSession,
} from '@rspack-devtools/kit'
import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { createEventEmitter } from '@rspack-devtools/kit'

let terminalCounter = 0

export class DevToolsTerminalHost implements DevToolsTerminalHostType {
  public readonly sessions: Map<string, TerminalSession> = new Map()
  public readonly events: EventEmitter<{
    'terminal:session:updated': () => void
    'terminal:session:stream-chunk': (data: { id: string; data: string }) => void
  }> = createEventEmitter()

  private processes: Map<string, ChildProcess> = new Map()

  run(command: string, cwd?: string, name?: string): string {
    const id = `terminal-${++terminalCounter}`
    const session: TerminalSession = {
      id,
      name: name || command,
      command,
      cwd: cwd || process.cwd(),
      status: 'running',
      buffer: '',
      startTime: Date.now(),
    }
    this.sessions.set(id, session)

    const parts = command.split(/\s+/)
    const child = spawn(parts[0], parts.slice(1), {
      cwd: session.cwd,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    this.processes.set(id, child)

    const handleData = (data: Buffer) => {
      const text = data.toString()
      session.buffer += text
      this.events.emit('terminal:session:stream-chunk', { id, data: text })
    }

    child.stdout?.on('data', handleData)
    child.stderr?.on('data', handleData)

    child.on('exit', (code) => {
      session.status = 'exited'
      session.exitCode = code ?? 1
      session.endTime = Date.now()
      this.events.emit('terminal:session:updated')
    })

    this.events.emit('terminal:session:updated')
    return id
  }

  list(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }
}
