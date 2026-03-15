import type { Preset } from 'unocss'
import { shortcuts } from './shortcuts'
import { theme } from './theme'

export function presetDevToolsUI(): Preset {
  return {
    name: '@rspack-devtools/ui',
    shortcuts,
    theme,
  }
}
