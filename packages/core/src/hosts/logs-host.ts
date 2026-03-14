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

export class DevToolsLogsHost implements DevToolsLogsHostType {
  public readonly entries: Map<string, DevToolsLogEntry> = new Map()
  public readonly events: EventEmitter<{
    'log:added': (entry: DevToolsLogEntry) => void
    'log:updated': (entry: DevToolsLogEntry) => void
    'log:removed': (id: string) => void
    'log:cleared': () => void
  }> = createEventEmitter()

  private _autoDeleteTimers = new Map<string, ReturnType<typeof setTimeout>>()

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
      this.events.emit('log:removed', id)
    }
  }

  async clear(): Promise<void> {
    for (const timer of this._autoDeleteTimers.values()) {
      clearTimeout(timer)
    }
    this._autoDeleteTimers.clear()
    this.entries.clear()
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
