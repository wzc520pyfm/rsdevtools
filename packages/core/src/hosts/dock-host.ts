import type {
  DevToolsDockEntry,
  DevToolsDockHost as DevToolsDockHostType,
  DevToolsDockUserEntry,
  DevToolsNodeContext,
  DevToolsViewBuiltin,
  EventEmitter,
} from '@rspack-devtools/kit'
import { createEventEmitter } from '@rspack-devtools/kit'

export class DevToolsDockHost implements DevToolsDockHostType {
  public readonly views: Map<string, DevToolsDockUserEntry> = new Map()
  public readonly events: EventEmitter<{
    'dock:entry:updated': (entry: DevToolsDockUserEntry) => void
  }> = createEventEmitter()

  constructor(
    public readonly context: DevToolsNodeContext,
  ) {}

  values(options: { includeBuiltin?: boolean } = {}): DevToolsDockEntry[] {
    const { includeBuiltin = true } = options
    const context = this.context

    const builtinEntries: DevToolsViewBuiltin[] = [
      {
        type: '~builtin',
        id: '~terminals',
        title: 'Terminals',
        icon: 'ph:terminal-duotone',
        category: '~builtin',
        get isHidden() {
          return context.terminals.sessions.size === 0
        },
      },
      {
        type: '~builtin',
        id: '~logs',
        title: 'Logs & Notifications',
        icon: 'ph:notification-duotone',
        category: '~builtin',
        get badge() {
          const size = context.logs.entries.size
          return size > 0 ? String(size) : undefined
        },
      },
      {
        type: '~builtin',
        id: '~popup',
        title: 'Popup',
        category: '~builtin',
        icon: 'ph:arrow-square-out-duotone',
      },
      {
        type: '~builtin',
        id: '~settings',
        title: 'Settings',
        category: '~builtin',
        icon: 'ph:gear-duotone',
      },
    ]

    return [
      ...Array.from(this.views.values()),
      ...(includeBuiltin ? builtinEntries : []),
    ]
  }

  register<T extends DevToolsDockUserEntry>(
    view: T,
    force?: boolean,
  ): { update: (patch: Partial<T>) => void } {
    if (this.views.has(view.id) && !force) {
      throw new Error(`Dock with id "${view.id}" is already registered`)
    }

    this.views.set(view.id, view)
    this.events.emit('dock:entry:updated', view)

    return {
      update: (patch) => {
        if (patch.id && patch.id !== view.id) {
          throw new Error(`Cannot change the id of a dock. Use register() to add new docks.`)
        }
        this.update(Object.assign(this.views.get(view.id)!, patch))
      },
    }
  }

  update(view: DevToolsDockUserEntry): void {
    if (!this.views.has(view.id)) {
      throw new Error(`Dock with id "${view.id}" is not registered. Use register() to add new docks.`)
    }
    this.views.set(view.id, view)
    this.events.emit('dock:entry:updated', view)
  }
}
