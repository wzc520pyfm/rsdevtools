import type { EventEmitter } from './events'

export interface DevToolsLogEntry {
  id: string
  message: string
  level: 'info' | 'warn' | 'error' | 'success' | 'debug'
  description?: string
  from: 'server' | 'browser'
  timestamp: number
  notify?: boolean
  filePosition?: {
    file: string
    line?: number
    column?: number
  }
  elementPosition?: {
    selector?: string
    boundingBox?: { x: number; y: number; width: number; height: number }
    description?: string
  }
  status?: 'loading' | 'idle'
  category?: string
  labels?: string[]
  autoDismiss?: number
  autoDelete?: number
}

export type DevToolsLogEntryInput = Omit<DevToolsLogEntry, 'id' | 'from' | 'timestamp'> & {
  id?: string
  from?: 'server' | 'browser'
  timestamp?: number
}

export interface DevToolsLogHandle {
  readonly id: string
  readonly entry: DevToolsLogEntry
  update: (patch: Partial<DevToolsLogEntryInput>) => Promise<DevToolsLogEntry | undefined>
  dismiss: () => Promise<void>
}

export interface DevToolsLogsHost {
  readonly entries: Map<string, DevToolsLogEntry>
  readonly events: EventEmitter<{
    'log:added': (entry: DevToolsLogEntry) => void
    'log:updated': (entry: DevToolsLogEntry) => void
    'log:removed': (id: string) => void
    'log:cleared': () => void
  }>
  add: (input: DevToolsLogEntryInput) => Promise<DevToolsLogHandle>
  update: (id: string, patch: Partial<DevToolsLogEntryInput>) => Promise<DevToolsLogEntry | undefined>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
}
