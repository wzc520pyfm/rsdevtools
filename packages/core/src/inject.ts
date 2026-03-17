import type { DevToolsDockUserEntry } from '@rspack-devtools/kit'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { InjectConfig, SerializedDock } from './client-inject/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

let _bundleCache: string | undefined

function getClientBundle(): string {
  if (!_bundleCache) {
    const bundlePath = join(__dirname, 'client-inject.global.js')
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

function serializeDocks(docks: DevToolsDockUserEntry[]): SerializedDock[] {
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
      base.launcher = {
        title: dock.launcher.title,
        description: dock.launcher.description,
        buttonStart: dock.launcher.buttonStart ?? 'Launch',
        buttonLoading: dock.launcher.buttonLoading ?? 'Loading...',
        status: dock.launcher.status,
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
