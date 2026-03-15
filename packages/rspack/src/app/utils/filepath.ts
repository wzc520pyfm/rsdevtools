export function getFileName(path: string): string {
  const segments = path.split('/')
  return segments[segments.length - 1] || path
}

export function getDirectory(path: string): string {
  const segments = path.split('/')
  segments.pop()
  return segments.join('/') || '/'
}

export function getExtension(path: string): string {
  const name = getFileName(path)
  const dotIndex = name.lastIndexOf('.')
  return dotIndex >= 0 ? name.slice(dotIndex) : ''
}

export function isNodeModules(path: string): boolean {
  return path.includes('node_modules')
}

export function normalizeModulePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/\?.*$/, '')
}

export function getPackageName(path: string): string | null {
  const nmIdx = path.lastIndexOf('node_modules/')
  if (nmIdx === -1) return null
  const afterNm = path.slice(nmIdx + 'node_modules/'.length)
  if (afterNm.startsWith('@')) {
    const parts = afterNm.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0]
  }
  return afterNm.split('/')[0]
}
