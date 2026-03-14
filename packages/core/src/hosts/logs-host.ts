import type {
  DevToolsLogEntry,
  DevToolsLogEntryInput,
  DevToolsLogHandle,
  DevToolsLogsHost as DevToolsLogsHostType,
  EventEmitter,
} from '@rspack-devtools/kit'
import { createEventEmitter } from '@rspack-devtools/kit'
import { nanoid } from '@rspack-devtools/kit/utils/nanoid'

const MAX_ENTRIES = 1000

export interface LogsListResult {
  entries: DevToolsLogEntry[]
  removedIds: string[]
  version: number
}

export class DevToolsLogsHost implements DevToolsLogsHostType {
  public readonly entries: Map<string, DevToolsLogEntry> = new Map()
  public readonly events: EventEmitter<{
    'log:added': (entry: DevToolsLogEntry) => void
    'log:updated': (entry: DevToolsLogEntry) => void
    'log:removed': (id: string) => void
    'log:cleared': () => void
  }> = createEventEmitter()

  readonly lastModified = new Map<string, number>()
  readonly removals: Array<{ id: string; time: number }> = []
  private _clock = 0
  private _autoDeleteTimers = new Map<string, ReturnType<typeof setTimeout>>()

  private _tick(): number {
    return ++this._clock
  }

  list(since?: number): LogsListResult {
    const currentVersion = this._clock

    if (since === undefined) {
      return {
        entries: Array.from(this.entries.values()),
        removedIds: [],
        version: currentVersion,
      }
    }

    const entries: DevToolsLogEntry[] = []
    for (const [id, entry] of this.entries) {
      const mod = this.lastModified.get(id)
      if (mod !== undefined && mod > since) {
        entries.push(entry)
      }
    }

    const removedIds = this.removals
      .filter(r => r.time > since)
      .map(r => r.id)

    const cutoff = since
    while (this.removals.length > 0 && this.removals[0].time <= cutoff) {
      this.removals.shift()
    }

    return { entries, removedIds, version: currentVersion }
  }

  async add(input: DevToolsLogEntryInput): Promise<DevToolsLogHandle> {
    if (input.id && this.entries.has(input.id)) {
      await this.update(input.id, input)
      return this._createHandle(input.id)
    }

    const entry: DevToolsLogEntry = {
      ...input,
      id: input.id ?? nanoid(),
      timestamp: input.timestamp ?? Date.now(),
      from: input.from ?? 'server',
    }

    if (this.entries.size >= MAX_ENTRIES) {
      const oldest = this.entries.keys().next().value!
      await this.remove(oldest)
    }

    this.entries.set(entry.id, entry)
    this.lastModified.set(entry.id, this._tick())
    this.events.emit('log:added', entry)

    if (entry.autoDelete) {
      this._autoDeleteTimers.set(
        entry.id,
        setTimeout(() => this.remove(entry.id), entry.autoDelete),
      )
    }

    return this._createHandle(entry.id)
  }

  async update(
    id: string,
    patch: Partial<DevToolsLogEntryInput>,
  ): Promise<DevToolsLogEntry | undefined> {
    const existing = this.entries.get(id)
    if (!existing) return undefined

    const updated: DevToolsLogEntry = {
      ...existing,
      ...patch,
      id: existing.id,
      from: existing.from,
      timestamp: existing.timestamp,
    }

    this.entries.set(id, updated)
    this.lastModified.set(id, this._tick())
    this.events.emit('log:updated', updated)

    if (patch.autoDelete !== undefined) {
      const timer = this._autoDeleteTimers.get(id)
      if (timer) clearTimeout(timer)
      if (patch.autoDelete) {
        this._autoDeleteTimers.set(
          id,
          setTimeout(() => this.remove(id), patch.autoDelete),
        )
      }
    }

    return updated
  }

  async remove(id: string): Promise<void> {
    const timer = this._autoDeleteTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      this._autoDeleteTimers.delete(id)
    }
    if (this.entries.delete(id)) {
      this.lastModified.delete(id)
      this.removals.push({ id, time: this._tick() })
      this.events.emit('log:removed', id)
    }
  }

  async clear(): Promise<void> {
    for (const timer of this._autoDeleteTimers.values()) {
      clearTimeout(timer)
    }
    this._autoDeleteTimers.clear()

    for (const id of this.entries.keys()) {
      this.removals.push({ id, time: this._tick() })
    }

    this.entries.clear()
    this.lastModified.clear()
    this.events.emit('log:cleared')
  }

  private _createHandle(id: string): DevToolsLogHandle {
    const host = this
    return {
      get entry() {
        return host.entries.get(id)!
      },
      get id() {
        return id
      },
      update: (patch) => host.update(id, patch),
      dismiss: () => host.remove(id),
    }
  }
}
