import type { DevToolsViewHost as DevToolsViewHostType } from '@rspack-devtools/kit'
import { existsSync } from 'node:fs'

export class DevToolsViewHost implements DevToolsViewHostType {
  public staticDirs: Array<{ baseUrl: string; distDir: string }> = []

  hostStatic(baseUrl: string, distDir: string): void {
    if (!existsSync(distDir)) {
      throw new Error(`[Rspack DevTools] distDir ${distDir} does not exist`)
    }
    this.staticDirs.push({ baseUrl, distDir })
  }
}
