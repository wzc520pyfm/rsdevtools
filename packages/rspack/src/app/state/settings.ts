import { useLocalStorage } from '@vueuse/core'

export interface RspackDevToolsSettings {
  chartAnimation: boolean
  showNodeModules: boolean
  compactMode: boolean
  wordWrap: boolean
}

export const settings = useLocalStorage<RspackDevToolsSettings>('rspack-devtools-settings', {
  chartAnimation: true,
  showNodeModules: true,
  compactMode: false,
  wordWrap: false,
})
