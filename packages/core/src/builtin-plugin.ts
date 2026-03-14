import type { DevToolsNodeContext } from '@rspack-devtools/kit'

/**
 * Built-in Rspack Build Analysis plugin.
 * Registers the build analysis dock entry (iframe) that shows
 * modules, chunks, assets, graph, plugins, packages, etc.
 *
 * This is the equivalent of `@vitejs/devtools-rolldown` in vite-devtools.
 */
export function setupBuiltinBuildAnalysis(
  ctx: DevToolsNodeContext,
  clientBaseUrl: string,
): void {
  ctx.docks.register({
    type: 'iframe',
    id: 'rspack-build',
    title: 'Build Analysis',
    icon: 'ph:lightning-duotone',
    category: '~rspackplus',
    url: clientBaseUrl,
  })

  ctx.docks.register({
    type: 'iframe',
    id: 'rspack-explorer',
    title: 'File Explorer',
    icon: 'ph:folder-open-duotone',
    category: '~rspackplus',
    url: `${clientBaseUrl}/dock/explorer`,
  })

  ctx.docks.register({
    type: 'iframe',
    id: 'rspack-terminal',
    title: 'Terminal',
    icon: 'ph:terminal-duotone',
    category: '~rspackplus',
    url: `${clientBaseUrl}/dock/terminal`,
  })
}
