import type { ChildProcess } from 'node:child_process'
import type { TerminalSession } from './types'
import { spawn } from 'node:child_process'

let terminalCounter = 0

export class TerminalHost {
  sessions: Map<string, TerminalSession> = new Map()
  private processes: Map<string, ChildProcess> = new Map()
  private onOutput?: (id: string, data: string) => void
  private onExit?: (id: string, exitCode: number) => void

  setCallbacks(opts: {
    onOutput: (id: string, data: string) => void
    onExit: (id: string, exitCode: number) => void
  }) {
    this.onOutput = opts.onOutput
    this.onExit = opts.onExit
  }

  run(command: string, cwd?: string, name?: string): string {
    const id = `terminal-${++terminalCounter}-${Date.now()}`
    const session: TerminalSession = {
      id,
      name: name ?? command.split(' ')[0],
      command,
      cwd: cwd ?? process.cwd(),
      status: 'running',
      buffer: '',
      startTime: Date.now(),
    }

    this.sessions.set(id, session)

    const child = spawn(command, {
      shell: true,
      cwd: session.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.processes.set(id, child)

    const appendOutput = (data: Buffer) => {
      const text = data.toString()
      session.buffer += text
      this.onOutput?.(id, text)
    }

    child.stdout?.on('data', appendOutput)
    child.stderr?.on('data', appendOutput)

    child.on('close', (code) => {
      session.status = 'exited'
      session.exitCode = code ?? 0
      session.endTime = Date.now()
      this.processes.delete(id)
      this.onExit?.(id, code ?? 0)
    })

    child.on('error', (err) => {
      session.status = 'exited'
      session.exitCode = 1
      session.buffer += `\nError: ${err.message}\n`
      session.endTime = Date.now()
      this.processes.delete(id)
      this.onExit?.(id, 1)
    })

    return id
  }

  list(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }
}
