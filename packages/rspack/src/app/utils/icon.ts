export function getModuleTypeIcon(type: string): string {
  switch (type) {
    case 'javascript/auto':
    case 'javascript/dynamic':
    case 'javascript/esm':
      return 'i-carbon-logo-javascript text-yellow-500'
    case 'css':
    case 'css/module':
      return 'i-carbon-color-palette text-blue-400'
    case 'json':
      return 'i-carbon-json text-yellow-600'
    case 'asset':
    case 'asset/resource':
    case 'asset/inline':
    case 'asset/source':
      return 'i-carbon-image text-green-500'
    default:
      return 'i-carbon-document text-gray-500'
  }
}

export function getChunkTypeIcon(entry: boolean, initial: boolean): string {
  if (entry) return 'i-ph-house-duotone text-green-500'
  if (initial) return 'i-ph-flag-duotone text-blue-500'
  return 'i-ph-stack-duotone text-gray-500'
}
