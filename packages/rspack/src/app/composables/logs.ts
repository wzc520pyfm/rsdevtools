import type { DevToolsLogEntry } from '@rspack-devtools/kit'
import type { Reactive } from 'vue'
import { reactive } from 'vue'
import { onLogsUpdated, useRpc } from './rpc'

export interface LogsState {
  entries: DevToolsLogEntry[]
  unreadCount: number
}

let _logsState: Reactive<LogsState> | undefined

export function useLogs(): Reactive<LogsState> {
  if (_logsState)
    return _logsState

  const state: Reactive<LogsState> = _logsState = reactive({
    entries: [],
    unreadCount: 0,
  })

  const entryMap = new Map<string, DevToolsLogEntry>()
  let isInitialFetch = true
  let lastVersion: number | undefined
  const { call } = useRpc()

  async function updateLogs() {
    try {
      const result = await call('devtoolskit:internal:logs:list', lastVersion)
      let newCount = 0

      for (const id of result.removedIds)
        entryMap.delete(id)

      for (const entry of result.entries) {
        if (!entryMap.has(entry.id))
          newCount++
        entryMap.set(entry.id, entry)
      }

      state.entries = Array.from(entryMap.values())
      state.unreadCount += newCount
      lastVersion = result.version
      isInitialFetch = false
    }
    catch {}
  }

  onLogsUpdated(() => updateLogs())

  updateLogs()
  return state
}

export function markLogsAsRead(): void {
  if (_logsState)
    _logsState.unreadCount = 0
}
