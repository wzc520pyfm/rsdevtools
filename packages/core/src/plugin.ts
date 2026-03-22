import type { Compiler } from '@rspack/core'
import type { DevToolsNodeContext } from '@rspack-devtools/kit'
import type { RspackDevToolsOptions } from './types'
import type { DevToolsServer } from './server'
import { createRequire } from 'node:module'
import { DevToolsRspackUI, DataCollector } from '@rspack-devtools/rspack'
import { DevToolsSelfInspect } from '@rspack-devtools/self-inspect'
import { createDevToolsContext } from './context'
import { startDevToolsServer } from './server'
import { DevToolsRsdoctorUI } from './rsdoctor-adapter'

const _require = createRequire(import.meta.url)

export class RspackDevToolsPlugin {
  private options: RspackDevToolsOptions
  private collector: DataCollector
  private rsdoctorPlugin: any = null

  constructor(options: RspackDevToolsOptions = {}) {
    this.options = options
    this.collector = new DataCollector()
  }

  apply(compiler: Compiler) {
    let server: DevToolsServer | null = null
    let context: DevToolsNodeContext | null = null

    this.collector.setCwd(compiler.options.context ?? process.cwd())

    if (this.options.rsdoctor !== false) {
      try {
        const { RsdoctorRspackPlugin } = _require('@rsdoctor/rspack-plugin')
        const rsdoctorOpts = typeof this.options.rsdoctor === 'object' ? this.options.rsdoctor : {}

        this.rsdoctorPlugin = new RsdoctorRspackPlugin({
          port: rsdoctorOpts.port,
          features: rsdoctorOpts.features,
          printLog: { serverUrls: false },
        })

        // Prevent rsdoctor from opening a browser – the UI will be
        // embedded in rs-devtools as an iframe dock instead.
        this.rsdoctorPlugin.sdk.server.openClientPage = async () => {}

        this.rsdoctorPlugin.apply(compiler)
      }
      catch (err) {
        console.warn('[Rspack DevTools] Failed to initialise Rsdoctor plugin:', err)
        this.rsdoctorPlugin = null
      }
    }

    compiler.hooks.done.tapPromise('RspackDevToolsPlugin', async (stats) => {
      const pluginNames = (compiler.options.plugins ?? [])
        .map((p: any) => p?.constructor?.name ?? p?.name ?? 'unknown')
        .filter((n: string) => n !== 'unknown')

      const statsJson = stats.toJson({
        all: false,
        hash: true,
        timings: true,
        modules: true,
        chunks: true,
        assets: true,
        entrypoints: true,
        errors: true,
        errorDetails: true,
        errorStack: true,
        warnings: true,
        reasons: true,
        ids: true,
        chunkModules: true,
        nestedModules: true,
        chunkOrigins: true,
        source: true,
      })

      const session = this.collector.collectFromStats(statsJson, pluginNames)

      if (!server) {
        try {
          const builtinPlugins: any[] = []

          if (this.options.builtinDevTools !== false) {
            builtinPlugins.push(DevToolsRspackUI({
              collector: this.collector,
              launcher: this.options.launcher,
            }))
            builtinPlugins.push(DevToolsSelfInspect({ clientBaseUrl: '/.devtools-rspack' }))
          }

          if (this.rsdoctorPlugin) {
            builtinPlugins.push(DevToolsRsdoctorUI({ rsdoctorPlugin: this.rsdoctorPlugin }))
          }

          const allPlugins = [
            ...builtinPlugins,
            ...(compiler.options.plugins ?? []),
          ]

          context = await createDevToolsContext({
            cwd: compiler.options.context ?? process.cwd(),
            plugins: allPlugins,
            options: this.options,
          })

          server = await startDevToolsServer(context, this.options)
          const url = `http://${this.options.host ?? 'localhost'}:${server.port}`

          console.log()
          console.log(`  \x1B[36m\x1B[1m⬢ Rspack DevTools\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Local:    \x1B[36m${url}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Session:  \x1B[33m${session.id}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Modules:  \x1B[32m${session.modules.length}\x1B[0m  Chunks: \x1B[32m${session.chunks.length}\x1B[0m  Assets: \x1B[32m${session.assets.length}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Plugins:  \x1B[32m${session.plugins.length}\x1B[0m  Packages: \x1B[32m${session.packages.length}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Docks:    \x1B[32m${context.docks.values({ includeBuiltin: false }).length}\x1B[0m registered`)
          console.log(`  \x1B[2m└─\x1B[0m Duration: \x1B[32m${session.duration}ms\x1B[0m`)
          console.log()

          if (this.options.open) {
            const { exec } = await import('node:child_process')
            exec(`open ${url}`)
          }
        }
        catch (err) {
          console.error('[Rspack DevTools] Failed to start server:', err)
        }
      }

      server?.broadcast('rspack:build-completed', [{ id: session.id, timestamp: session.timestamp }])
    })
  }
}
