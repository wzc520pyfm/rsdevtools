import type { DevToolsNodeContext, DevToolsPluginOptions } from '@rspack-devtools/kit'
import { DataCollector } from './collector'
import { rspackBuildRpcDeclarations } from './rpc'
import { clientPublicDir } from '../dirs'

export interface LauncherConfig {
  /** Shell command to execute (e.g. 'npm run dev', 'rspack serve') */
  command: string
  /** Working directory. Defaults to project root (ctx.cwd) */
  cwd?: string
  /** Display name in the dock bar and launcher panel */
  title?: string
  /** Description shown in the launcher panel */
  description?: string
  /** Dock icon (Iconify name). Defaults to 'ph:rocket-launch-duotone' */
  icon?: string
  /** Text on the launch button. Defaults to 'Launch' */
  buttonStart?: string
  /** Text shown while launching. Defaults to 'Starting...' */
  buttonLoading?: string
  /**
   * After launch, replace this dock with an iframe (vite-devtools launcher pattern).
   * - Absolute `http(s)://...` URL.
   * - Root-relative path on the **DevTools server** (e.g. `/.devtools-rspack/`) — prefixed with devtools origin in the inject client.
   * - Path starting with `/__rdt_nested__/` — resolved against **`window.location.origin`** so the host app can `devServer.proxy` a second dev server (same origin → iframe works; see playground).
   *
   * Note: vite-devtools’ own playground iframe points at `https://antfu.me`, not a second local dev URL.
   */
  openUrlAfterLaunch?: string
  /** Dock title after switching to iframe */
  iframeTitleAfterLaunch?: string
  /** Dock icon after switching to iframe */
  iframeIconAfterLaunch?: string
}

/** Default launcher when none is configured (matches typical Rspack dev flow). */
export const DEFAULT_RSPACK_DEV_LAUNCHER: LauncherConfig = {
  command: 'rspack serve',
  title: 'Dev Server',
  description: 'Runs rspack serve in the Terminals panel.',
  icon: 'ph:rocket-launch-duotone',
  buttonStart: 'Launch',
  buttonLoading: 'Starting...',
}

export interface DevToolsRspackUIOptions {
  collector?: DataCollector
  /**
   * Launcher dock(s) that spawn terminal sessions.
   * - `undefined`: registers {@link DEFAULT_RSPACK_DEV_LAUNCHER} so the dock bar shows a launcher by default
   * - `false`: do not register any launcher
   * - object / array: custom launcher(s)
   */
  launcher?: LauncherConfig | LauncherConfig[] | false
}

const BASE_URL = '/.devtools-rspack/'

export function DevToolsRspackUI(options: DevToolsRspackUIOptions = {}): { devtools: DevToolsPluginOptions } & { name: string } {
  const collector = options.collector ?? new DataCollector()

  return {
    name: 'rspack-devtools-rspack-ui',
    devtools: {
      setup: async (ctx: DevToolsNodeContext) => {
        collector.setCwd(ctx.cwd)

        ctx.views.hostStatic(BASE_URL, clientPublicDir)

        ctx.docks.register({
          type: 'iframe',
          id: 'rspack-build',
          title: 'Build Analysis',
          icon: 'ph:lightning-duotone',
          category: '~rspackplus',
          url: BASE_URL,
        })

        if (options.launcher !== false) {
          const launchers = options.launcher === undefined
            ? [DEFAULT_RSPACK_DEV_LAUNCHER]
            : (Array.isArray(options.launcher) ? options.launcher : [options.launcher])
          for (let i = 0; i < launchers.length; i++) {
            const config = launchers[i]
            const id = `rspack-launcher-${i}`
            const title = config.title || config.command

            ctx.docks.register({
              id,
              type: 'launcher',
              icon: config.icon || 'ph:rocket-launch-duotone',
              title,
              category: 'app',
              launcher: {
                title,
                description: config.description,
                buttonStart: config.buttonStart || 'Launch',
                buttonLoading: config.buttonLoading || 'Starting...',
                onLaunch: async () => {
                  ctx.terminals.run(
                    config.command,
                    config.cwd || ctx.cwd,
                    title,
                  )
                  if (config.openUrlAfterLaunch) {
                    ctx.docks.update({
                      id,
                      type: 'iframe',
                      url: config.openUrlAfterLaunch,
                      title: config.iframeTitleAfterLaunch ?? title,
                      icon: config.iframeIconAfterLaunch ?? (config.icon || 'ph:rocket-launch-duotone'),
                      category: 'app',
                    } as any)
                  }
                },
              },
            })
          }
        }

        for (const fn of rspackBuildRpcDeclarations(collector, ctx.terminals)) {
          ctx.rpc.register(fn)
        }
      },
    },
  }
}

export { DataCollector }
