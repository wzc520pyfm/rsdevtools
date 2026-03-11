import type { Compiler } from '@rspack/core'
import type { RspackDevToolsOptions } from './types'
import type { DevToolsServer } from './server'
import { DataCollector } from './collector'
import { getInjectScript } from './inject'
import { startDevToolsServer } from './server'

export class RspackDevToolsPlugin {
  private options: RspackDevToolsOptions
  private collector: DataCollector

  constructor(options: RspackDevToolsOptions = {}) {
    this.options = options
    this.collector = new DataCollector()
  }

  apply(compiler: Compiler) {
    let server: DevToolsServer | null = null

    this.collector.setCwd(compiler.options.context ?? process.cwd())

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
          server = await startDevToolsServer(this.collector, this.options)
          const url = `http://${this.options.host ?? 'localhost'}:${server.port}`

          console.log()
          console.log(`  \x1B[36m\x1B[1m⬢ Rspack DevTools\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Local:    \x1B[36m${url}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Session:  \x1B[33m${session.id}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Modules:  \x1B[32m${session.modules.length}\x1B[0m  Chunks: \x1B[32m${session.chunks.length}\x1B[0m  Assets: \x1B[32m${session.assets.length}\x1B[0m`)
          console.log(`  \x1B[2m├─\x1B[0m Plugins:  \x1B[32m${session.plugins.length}\x1B[0m  Packages: \x1B[32m${session.packages.length}\x1B[0m`)
          console.log(`  \x1B[2m└─\x1B[0m Duration: \x1B[32m${session.duration}ms\x1B[0m`)
          console.log()

          if (this.options.open) {
            const { exec } = await import('node:child_process')
            exec(`open ${url}`)
          }

          this.injectIntoDevServer(compiler, server)
        }
        catch (err) {
          console.error('[Rspack DevTools] Failed to start server:', err)
        }
      }

      server?.broadcast('rspack:build-completed', [{ id: session.id, timestamp: session.timestamp }])
    })
  }

  private injectIntoDevServer(compiler: Compiler, server: DevToolsServer) {
    const host = this.options.host ?? 'localhost'
    const injectScript = getInjectScript(server.port, host)

    try {
      const devServer = (compiler as any).options?.devServer
      if (devServer) {
        const originalSetupMiddlewares = devServer.setupMiddlewares
        devServer.setupMiddlewares = (middlewares: any[], devSrv: any) => {
          middlewares = originalSetupMiddlewares
            ? originalSetupMiddlewares(middlewares, devSrv)
            : middlewares

          middlewares.unshift({
            name: 'rspack-devtools-inject',
            middleware: (req: any, res: any, next: any) => {
              const originalEnd = res.end.bind(res)
              const originalWrite = res.write.bind(res)
              const isHtml = req.headers?.accept?.includes('text/html')

              if (!isHtml) return next()

              let body = ''
              res.write = (chunk: any) => { body += chunk.toString(); return true }
              res.end = (chunk: any) => {
                if (chunk) body += chunk.toString()
                if (body.includes('</body>')) {
                  body = body.replace('</body>', `${injectScript}\n</body>`)
                }
                originalEnd(body)
              }
              next()
            },
          })

          return middlewares
        }
      }
    }
    catch {}
  }
}
