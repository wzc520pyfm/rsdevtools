import type { RpcFunctionDefinition } from '@rspack-devtools/kit'

export function rspackOpenInEditor(): RpcFunctionDefinition {
  return {
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
  }
}
