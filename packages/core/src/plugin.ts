import type { Compiler } from '@rspack/core'
import type { RspackDevToolsOptions } from './types'
import { DataCollector } from './collector'
import { startDevToolsServer } from './server'

export class RspackDevToolsPlugin {
  private options: RspackDevToolsOptions
  private collector: DataCollector

  constructor(options: RspackDevToolsOptions = {}) {
    this.options = options
    this.collector = new DataCollector()
  }

  apply(compiler: Compiler) {
    let serverStarted = false

    compiler.hooks.done.tapPromise('RspackDevToolsPlugin', async (stats) => {
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
      })

      const session = this.collector.collectFromStats(statsJson)

      if (!serverStarted) {
        serverStarted = true
        try {
          const server = await startDevToolsServer(this.collector, this.options)
          const url = `http://${this.options.host ?? 'localhost'}:${server.port}`

          console.log()
          console.log(`  \x1B[36m\x1B[1m⬢ Rspack DevTools\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Local:   \x1B[36m${url}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Session: \x1B[33m${session.id}\x1B[0m`)
          console.log(`  \x1B[2m└─\x1B[0m Modules: \x1B[32m${session.modules.length}\x1B[0m  Chunks: \x1B[32m${session.chunks.length}\x1B[0m  Assets: \x1B[32m${session.assets.length}\x1B[0m`)
          console.log()

          if (this.options.open) {
            const { exec } = await import('node:child_process')
            exec(`open ${url}`)
          }

          server.broadcast('rspack:build-completed', [{ id: session.id, timestamp: session.timestamp }])
        }
        catch (err) {
          console.error('[Rspack DevTools] Failed to start server:', err)
        }
      }
    })
  }
}
