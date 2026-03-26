export { getHashColorFromString, getHsla } from '@rspack-devtools/ui/utils/color'

import { getHashColorFromString as _getHashColorFromString, getHsla as _getHsla } from '@rspack-devtools/ui/utils/color'

const predefinedColorMap: Record<string, number> = {
  rspack: 200,
  webpack: 40,
}

export function getPluginColor(name: string, opacity = 1): string {
  const key = name.replace(/[^a-z]+/gi, '').toLowerCase()
  if (key in predefinedColorMap) {
    return _getHsla(predefinedColorMap[key]!, opacity)
  }
  return _getHashColorFromString(key, opacity)
}
