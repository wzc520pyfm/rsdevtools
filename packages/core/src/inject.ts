import type { DevToolsDockUserEntry } from '@rspack-devtools/kit'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InjectConfig, SerializedDock } from './client-inject/types'
import { moduleDirname } from './module-dir'

let _bundleCache: string | undefined

function getClientBundle(): string {
  if (!_bundleCache) {
    const bundlePath = join(moduleDirname, 'client-inject.global.js')
    try {
      _bundleCache = readFileSync(bundlePath, 'utf-8')
    }
    catch (err) {
      throw new Error(
        `[Rspack DevTools] Failed to read client inject bundle at ${bundlePath}. `
        + `Make sure the package was built correctly (run "pnpm build" in packages/core).`,
        { cause: err },
      )
    }
  }
  return _bundleCache
}

export function serializeDocks(docks: DevToolsDockUserEntry[]): SerializedDock[] {
  return docks.map((dock) => {
    const icon = typeof dock.icon === 'string' ? dock.icon : dock.icon.light
    const base: SerializedDock = {
      id: dock.id,
      title: dock.title,
      icon,
      type: dock.type,
      category: dock.category,
    }
    if (dock.type === 'iframe') base.url = dock.url
    if (dock.type === 'launcher') {
      const L = dock.launcher
      base.launcher = {
        title: (L?.title ?? dock.title) || 'Launcher',
        description: L?.description,
        buttonStart: L?.buttonStart ?? 'Launch',
        buttonLoading: L?.buttonLoading ?? 'Loading...',
        status: L?.status,
        error: L?.error,
      }
    }
    if (dock.type === 'action') base.action = { importFrom: dock.action.importFrom, importName: dock.action.importName }
    if (dock.type === 'custom-render') base.renderer = { importFrom: dock.renderer.importFrom, importName: dock.renderer.importName }
    return base
  })
}

export function getInjectClientScript(
  port: number,
  host: string = 'localhost',
  dockEntries: DevToolsDockUserEntry[] = [],
  clientAuth: boolean = true,
): string {
  const config: InjectConfig = {
    devtoolsUrl: `http://${host}:${port}`,
    wsPort: port,
    host,
    clientAuth,
    docks: serializeDocks(dockEntries),
  }

  const bundle = getClientBundle()
  return `window.__RSPACK_DEVTOOLS_INJECT_CONFIG__=${JSON.stringify(config)};\n${bundle}`
}

export function getInjectScript(
  port: number,
  host: string = 'localhost',
  dockEntries: DevToolsDockUserEntry[] = [],
  clientAuth: boolean = true,
): string {
  return `<script>${getInjectClientScript(port, host, dockEntries, clientAuth)}</script>`
}
