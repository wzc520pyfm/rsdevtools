import type { DataCollector } from './collector'
import type { TerminalHost } from './terminal'
import type { FileDetail, FileEntry, ServerFunctions, SessionComparison } from './types'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { glob } from 'tinyglobby'

export function createRpcFunctions(collector: DataCollector, terminalHost: TerminalHost): ServerFunctions {
  const cwd = collector.getCwd()

  return {
    'rspack:list-sessions': async () => {
      return Array.from(collector.sessions.values())
        .map(s => ({ id: s.id, timestamp: s.timestamp, duration: s.duration, hash: s.hash }))
        .sort((a, b) => b.timestamp - a.timestamp)
    },

    'rspack:get-session': async ({ session }) => {
      return collector.sessions.get(session) ?? null
    },

    'rspack:get-modules': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.modules ?? []
    },

    'rspack:get-module-info': async ({ session, module: moduleId }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.modules.find(m => m.id === moduleId) ?? null
    },

    'rspack:get-chunks': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.chunks ?? []
    },

    'rspack:get-chunk-info': async ({ session, chunk }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.chunks.find(c => c.id === chunk) ?? null
    },

    'rspack:get-assets': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.assets ?? []
    },

    'rspack:get-asset-details': async ({ session, asset }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.assets.find(a => a.name === asset) ?? null
    },

    'rspack:get-entrypoints': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.entrypoints ?? []
    },

    'rspack:get-errors': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.errors ?? []
    },

    'rspack:get-warnings': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.warnings ?? []
    },

    'rspack:get-module-graph': async ({ session }) => {
      const s = collector.sessions.get(session)
      if (!s) return { nodes: [], edges: [] }
      return collector.buildModuleGraph(s)
    },

    'rspack:get-plugins': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.plugins ?? []
    },

    'rspack:get-packages': async ({ session }) => {
      const s = collector.sessions.get(session)
      return s?.packages ?? []
    },

    'rspack:get-package-details': async ({ session, name }) => {
      const s = collector.sessions.get(session)
      if (!s) return null
      return s.packages.find(p => p.name === name) ?? null
    },

    'rspack:compare-sessions': async ({ sessions: sessionIds }) => {
      const sessionData = sessionIds.map(id => collector.sessions.get(id)).filter(Boolean) as any[]
      if (sessionData.length < 2) return null

      const comparison: SessionComparison = {
        sessions: sessionData.map(s => ({ id: s.id, timestamp: s.timestamp, duration: s.duration })),
        metrics: [
          {
            label: 'Build Duration',
            values: sessionData.map(s => s.duration),
            unit: 'ms',
            type: 'duration',
          },
          {
            label: 'Total Modules',
            values: sessionData.map(s => s.modules.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Total Chunks',
            values: sessionData.map(s => s.chunks.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Total Assets',
            values: sessionData.map(s => s.assets.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Bundle Size',
            values: sessionData.map(s => s.assets.reduce((sum: number, a: any) => sum + a.size, 0)),
            unit: 'bytes',
            type: 'size',
          },
          {
            label: 'Errors',
            values: sessionData.map(s => s.errors.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Warnings',
            values: sessionData.map(s => s.warnings.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Plugins',
            values: sessionData.map(s => s.plugins.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Packages',
            values: sessionData.map(s => s.packages.length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Duplicate Packages',
            values: sessionData.map(s => s.packages.filter((p: any) => p.isDuplicate).length),
            unit: '',
            type: 'count',
          },
          {
            label: 'Initial JS Size',
            values: sessionData.map(s =>
              s.assets.filter((a: any) => a.name.endsWith('.js') && s.chunks.some((c: any) => c.initial && c.files.includes(a.name)))
                .reduce((sum: number, a: any) => sum + a.size, 0),
            ),
            unit: 'bytes',
            type: 'size',
          },
        ],
      }
      return comparison
    },

    'rspack:open-in-editor': async ({ path: filePath, line, column }) => {
      try {
        const launch = (await import('launch-editor')).default
        const target = line ? `${filePath}:${line}:${column ?? 1}` : filePath
        launch(target)
      } catch {
        const { exec } = await import('node:child_process')
        exec(`code "${filePath}"`)
      }
    },

    'rspack:open-in-finder': async ({ path: filePath }) => {
      const { exec } = await import('node:child_process')
      const platform = process.platform
      if (platform === 'darwin') exec(`open -R "${filePath}"`)
      else if (platform === 'win32') exec(`explorer /select,"${filePath}"`)
      else exec(`xdg-open "${filePath}"`)
    },

    'rspack:get-terminals': async () => {
      return terminalHost.list()
    },

    'rspack:run-terminal': async ({ command, cwd: termCwd, name }) => {
      return terminalHost.run(command, termCwd, name)
    },

    'rspack:get-file-info': async () => {
      return { rootDir: resolve(cwd, 'src') }
    },

    'rspack:list-files': async ({ targetDir }) => {
      const rootDir = resolve(cwd, targetDir || 'src')
      if (!existsSync(rootDir)) return []
      const files = await glob(['**/*'], { cwd: rootDir, absolute: true, onlyFiles: true, dot: false })
      return files
        .sort((a, b) => a.localeCompare(b))
        .map((absolutePath): FileEntry => {
          const filePath = relative(rootDir, absolutePath).replace(/\\/g, '/')
          let size = 0
          try { size = statSync(absolutePath).size } catch {}
          return { path: filePath, size, ext: extname(filePath) }
        })
    },

    'rspack:read-file': async ({ path: filePath }) => {
      const rootDir = resolve(cwd, 'src')
      const absolutePath = resolve(rootDir, filePath)
      if (!absolutePath.startsWith(rootDir)) return null
      try {
        const content = readFileSync(absolutePath, 'utf-8')
        const size = statSync(absolutePath).size
        return { path: filePath, content, size } as FileDetail
      } catch {
        return null
      }
    },

    'rspack:write-file': async ({ path: filePath, content }) => {
      const rootDir = resolve(cwd, 'src')
      const absolutePath = resolve(rootDir, filePath)
      if (!absolutePath.startsWith(rootDir)) throw new Error('Path traversal not allowed')
      writeFileSync(absolutePath, content, 'utf-8')
    },
  }
}
