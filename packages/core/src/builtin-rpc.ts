import type { DevToolsLogEntryInput, RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DataCollector } from './collector'
import type { DevToolsLogsHost } from './hosts/logs-host'
import type { DevToolsTerminalHost } from './hosts/terminal-host'
import type { FileDetail, FileEntry, SessionComparison } from './types'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { glob } from 'tinyglobby'

export function builtinRpcDeclarations(
  collector: DataCollector,
  terminalHost: DevToolsTerminalHost,
): RpcFunctionDefinition[] {
  const cwd = collector.getCwd()

  return [
    {
      name: 'rspack:list-sessions',
      type: 'query',
      setup: () => ({
        handler: async () =>
          Array.from(collector.sessions.values())
            .map(s => ({ id: s.id, timestamp: s.timestamp, duration: s.duration, hash: s.hash }))
            .sort((a, b) => b.timestamp - a.timestamp),
      }),
    },
    {
      name: 'rspack:get-session',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) =>
          collector.sessions.get(session) ?? null,
      }),
    },
    {
      name: 'rspack:get-modules',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.modules ?? []
        },
      }),
    },
    {
      name: 'rspack:get-module-info',
      type: 'query',
      setup: () => ({
        handler: async ({ session, module: moduleId }: { session: string; module: string }) => {
          const s = collector.sessions.get(session)
          if (!s) return null
          return s.modules.find(m => m.id === moduleId) ?? null
        },
      }),
    },
    {
      name: 'rspack:get-chunks',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.chunks ?? []
        },
      }),
    },
    {
      name: 'rspack:get-chunk-info',
      type: 'query',
      setup: () => ({
        handler: async ({ session, chunk }: { session: string; chunk: string }) => {
          const s = collector.sessions.get(session)
          if (!s) return null
          return s.chunks.find(c => c.id === chunk) ?? null
        },
      }),
    },
    {
      name: 'rspack:get-assets',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.assets ?? []
        },
      }),
    },
    {
      name: 'rspack:get-asset-details',
      type: 'query',
      setup: () => ({
        handler: async ({ session, asset }: { session: string; asset: string }) => {
          const s = collector.sessions.get(session)
          if (!s) return null
          return s.assets.find(a => a.name === asset) ?? null
        },
      }),
    },
    {
      name: 'rspack:get-entrypoints',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.entrypoints ?? []
        },
      }),
    },
    {
      name: 'rspack:get-errors',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.errors ?? []
        },
      }),
    },
    {
      name: 'rspack:get-warnings',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.warnings ?? []
        },
      }),
    },
    {
      name: 'rspack:get-module-graph',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          if (!s) return { nodes: [], edges: [] }
          return collector.buildModuleGraph(s)
        },
      }),
    },
    {
      name: 'rspack:get-plugins',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.plugins ?? []
        },
      }),
    },
    {
      name: 'rspack:get-packages',
      type: 'query',
      setup: () => ({
        handler: async ({ session }: { session: string }) => {
          const s = collector.sessions.get(session)
          return s?.packages ?? []
        },
      }),
    },
    {
      name: 'rspack:get-package-details',
      type: 'query',
      setup: () => ({
        handler: async ({ session, name }: { session: string; name: string }) => {
          const s = collector.sessions.get(session)
          if (!s) return null
          return s.packages.find(p => p.name === name) ?? null
        },
      }),
    },
    {
      name: 'rspack:compare-sessions',
      type: 'query',
      setup: () => ({
        handler: async ({ sessions: sessionIds }: { sessions: string[] }) => {
          const sessionData = sessionIds
            .map(id => collector.sessions.get(id))
            .filter(Boolean) as any[]
          if (sessionData.length < 2) return null

          const comparison: SessionComparison = {
            sessions: sessionData.map((s: any) => ({
              id: s.id,
              timestamp: s.timestamp,
              duration: s.duration,
            })),
            metrics: [
              { label: 'Build Duration', values: sessionData.map((s: any) => s.duration), unit: 'ms', type: 'duration' },
              { label: 'Total Modules', values: sessionData.map((s: any) => s.modules.length), unit: '', type: 'count' },
              { label: 'Total Chunks', values: sessionData.map((s: any) => s.chunks.length), unit: '', type: 'count' },
              { label: 'Total Assets', values: sessionData.map((s: any) => s.assets.length), unit: '', type: 'count' },
              { label: 'Bundle Size', values: sessionData.map((s: any) => s.assets.reduce((sum: number, a: any) => sum + a.size, 0)), unit: 'bytes', type: 'size' },
              { label: 'Errors', values: sessionData.map((s: any) => s.errors.length), unit: '', type: 'count' },
              { label: 'Warnings', values: sessionData.map((s: any) => s.warnings.length), unit: '', type: 'count' },
              { label: 'Plugins', values: sessionData.map((s: any) => s.plugins.length), unit: '', type: 'count' },
              { label: 'Packages', values: sessionData.map((s: any) => s.packages.length), unit: '', type: 'count' },
              { label: 'Duplicate Packages', values: sessionData.map((s: any) => s.packages.filter((p: any) => p.isDuplicate).length), unit: '', type: 'count' },
              {
                label: 'Initial JS Size',
                values: sessionData.map((s: any) =>
                  s.assets
                    .filter((a: any) => a.name.endsWith('.js') && s.chunks.some((c: any) => c.initial && c.files.includes(a.name)))
                    .reduce((sum: number, a: any) => sum + a.size, 0),
                ),
                unit: 'bytes',
                type: 'size',
              },
            ],
          }
          return comparison
        },
      }),
    },
    {
      name: 'rspack:open-in-editor',
      type: 'action',
      setup: () => ({
        handler: async ({ path: filePath, line, column }: { path: string; line?: number; column?: number }) => {
          try {
            const launch = (await import('launch-editor')).default
            const target = line ? `${filePath}:${line}:${column ?? 1}` : filePath
            launch(target)
          }
          catch {
            const { exec } = await import('node:child_process')
            exec(`code "${filePath}"`)
          }
        },
      }),
    },
    {
      name: 'rspack:open-in-finder',
      type: 'action',
      setup: () => ({
        handler: async ({ path: filePath }: { path: string }) => {
          const { exec } = await import('node:child_process')
          const platform = process.platform
          if (platform === 'darwin') exec(`open -R "${filePath}"`)
          else if (platform === 'win32') exec(`explorer /select,"${filePath}"`)
          else exec(`xdg-open "${filePath}"`)
        },
      }),
    },
    {
      name: 'rspack:get-terminals',
      type: 'query',
      setup: () => ({
        handler: async () => terminalHost.list(),
      }),
    },
    {
      name: 'rspack:run-terminal',
      type: 'action',
      setup: () => ({
        handler: async ({ command, cwd: termCwd, name }: { command: string; cwd?: string; name?: string }) =>
          terminalHost.run(command, termCwd, name),
      }),
    },
    {
      name: 'rspack:get-file-info',
      type: 'query',
      setup: () => ({
        handler: async () => ({ rootDir: resolve(cwd, 'src') }),
      }),
    },
    {
      name: 'rspack:list-files',
      type: 'query',
      setup: () => ({
        handler: async ({ targetDir }: { targetDir?: string }) => {
          const rootDir = resolve(cwd, targetDir || 'src')
          if (!existsSync(rootDir)) return []
          const files = await glob(['**/*'], { cwd: rootDir, absolute: true, onlyFiles: true, dot: false })
          return files
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((absolutePath: string): FileEntry => {
              const filePath = relative(rootDir, absolutePath).replace(/\\/g, '/')
              let size = 0
              try { size = statSync(absolutePath).size } catch {}
              return { path: filePath, size, ext: extname(filePath) }
            })
        },
      }),
    },
    {
      name: 'rspack:read-file',
      type: 'query',
      setup: () => ({
        handler: async ({ path: filePath }: { path: string }) => {
          const rootDir = resolve(cwd, 'src')
          const absolutePath = resolve(rootDir, filePath)
          if (!absolutePath.startsWith(rootDir)) return null
          try {
            const content = readFileSync(absolutePath, 'utf-8')
            const size = statSync(absolutePath).size
            return { path: filePath, content, size } as FileDetail
          }
          catch {
            return null
          }
        },
      }),
    },
    {
      name: 'rspack:write-file',
      type: 'action',
      setup: () => ({
        handler: async ({ path: filePath, content }: { path: string; content: string }) => {
          const rootDir = resolve(cwd, 'src')
          const absolutePath = resolve(rootDir, filePath)
          if (!absolutePath.startsWith(rootDir)) throw new Error('Path traversal not allowed')
          writeFileSync(absolutePath, content, 'utf-8')
        },
      }),
    },
    {
      name: 'rspack:get-docks',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => ctx.docks.values({ includeBuiltin: false }),
      }),
    },

    // ===== Internal: Logs =====
    {
      name: 'devtoolskit:internal:logs:list',
      type: 'query',
      setup: (ctx) => ({
        handler: async (since?: number) => {
          const host = ctx.logs as DevToolsLogsHost
          return host.list(since)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:add',
      type: 'action',
      setup: (ctx) => ({
        handler: async (input: DevToolsLogEntryInput) => {
          const handle = await ctx.logs.add({ ...input, from: input.from ?? 'browser' })
          return handle.entry
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:update',
      type: 'action',
      setup: (ctx) => ({
        handler: async (id: string, patch: Partial<DevToolsLogEntryInput>) => {
          return ctx.logs.update(id, patch)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:remove',
      type: 'action',
      setup: (ctx) => ({
        handler: async (id: string) => {
          await ctx.logs.remove(id)
        },
      }),
    },
    {
      name: 'devtoolskit:internal:logs:clear',
      type: 'action',
      setup: (ctx) => ({
        handler: async () => {
          await ctx.logs.clear()
        },
      }),
    },

    // ===== Internal: Launcher on-launch =====
    {
      name: 'devtoolskit:internal:docks:on-launch',
      type: 'action',
      setup: (ctx) => ({
        handler: async (dockId: string) => {
          const entry = ctx.docks.values({ includeBuiltin: false })
            .find(e => e.id === dockId)
          if (!entry || entry.type !== 'launcher') {
            throw new Error(`Dock "${dockId}" is not a launcher entry`)
          }
          const launcher = entry.launcher
          try {
            ctx.docks.update({ ...entry, launcher: { ...launcher, status: 'loading' } } as any)
            await launcher.onLaunch()
            ctx.docks.update({ ...entry, launcher: { ...launcher, status: 'success' } } as any)
          }
          catch (err: any) {
            ctx.docks.update({
              ...entry,
              launcher: { ...launcher, status: 'error', error: err?.message ?? String(err) },
            } as any)
            throw err
          }
        },
      }),
    },

    // ===== Internal: Self Inspect =====
    {
      name: 'devtoolskit:self-inspect:get-docks',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => ctx.docks.values(),
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-rpc-functions',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => {
          const host = ctx.rpc as any
          const defs = host.getDefinitions?.() as Map<string, RpcFunctionDefinition> | undefined
          if (!defs) return []
          return Array.from(defs.values()).map(d => ({
            name: d.name,
            type: d.type,
          }))
        },
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-client-scripts',
      type: 'query',
      setup: (ctx) => ({
        handler: async () => {
          const entries = ctx.docks.values({ includeBuiltin: false })
          const scripts: Array<{ dockId: string; dockTitle: string; type: string; importFrom?: string; importName?: string }> = []
          for (const entry of entries) {
            if (entry.type === 'action' && 'action' in entry) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'action',
                importFrom: entry.action.importFrom,
                importName: entry.action.importName,
              })
            }
            else if (entry.type === 'custom-render' && 'renderer' in entry) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'custom-render',
                importFrom: entry.renderer.importFrom,
                importName: entry.renderer.importName,
              })
            }
            else if (entry.type === 'iframe' && 'clientScript' in entry && entry.clientScript) {
              scripts.push({
                dockId: entry.id,
                dockTitle: entry.title,
                type: 'iframe',
                importFrom: entry.clientScript.importFrom,
                importName: entry.clientScript.importName,
              })
            }
          }
          return scripts
        },
      }),
    },
    {
      name: 'devtoolskit:self-inspect:get-devtools-plugins',
      type: 'query',
      setup: () => ({
        handler: async () => {
          return [] as Array<{ name: string; hasDevtools: boolean }>
        },
      }),
    },
  ]
}
