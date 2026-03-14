import type { EventEmitter } from './events'

export interface DevToolsDockHost {
  readonly views: Map<string, DevToolsDockUserEntry>
  readonly events: EventEmitter<{
    'dock:entry:updated': (entry: DevToolsDockUserEntry) => void
  }>

  register: <T extends DevToolsDockUserEntry>(entry: T, force?: boolean) => {
    update: (patch: Partial<T>) => void
  }
  update: (entry: DevToolsDockUserEntry) => void
  values: (options?: { includeBuiltin?: boolean }) => DevToolsDockEntry[]
}

export type DevToolsDockEntryCategory =
  | 'app'
  | 'framework'
  | 'web'
  | 'advanced'
  | 'default'
  | '~rspackplus'
  | '~builtin'

export type DevToolsDockEntryIcon = string | { light: string; dark: string }

export interface DevToolsDockEntryBase {
  id: string
  title: string
  icon: DevToolsDockEntryIcon
  defaultOrder?: number
  category?: DevToolsDockEntryCategory
  isHidden?: boolean
  badge?: string
}

export interface ClientScriptEntry {
  importFrom: string
  importName?: string
}

export interface DevToolsViewIframe extends DevToolsDockEntryBase {
  type: 'iframe'
  url: string
  frameId?: string
  clientScript?: ClientScriptEntry
}

export type DevToolsViewLauncherStatus = 'idle' | 'loading' | 'success' | 'error'

export interface DevToolsViewLauncher extends DevToolsDockEntryBase {
  type: 'launcher'
  launcher: {
    icon?: DevToolsDockEntryIcon
    title: string
    status?: DevToolsViewLauncherStatus
    error?: string
    description?: string
    buttonStart?: string
    buttonLoading?: string
    onLaunch: () => Promise<void>
  }
}

export interface DevToolsViewAction extends DevToolsDockEntryBase {
  type: 'action'
  action: ClientScriptEntry
}

export interface DevToolsViewCustomRender extends DevToolsDockEntryBase {
  type: 'custom-render'
  renderer: ClientScriptEntry
}

export interface DevToolsViewBuiltin extends DevToolsDockEntryBase {
  type: '~builtin'
  id: '~terminals' | '~logs' | '~settings' | '~popup'
}

export type DevToolsDockUserEntry =
  | DevToolsViewIframe
  | DevToolsViewAction
  | DevToolsViewCustomRender
  | DevToolsViewLauncher

export type DevToolsDockEntry = DevToolsDockUserEntry | DevToolsViewBuiltin

export type DevToolsDockEntriesGrouped = [
  category: string,
  entries: DevToolsDockEntry[],
][]
