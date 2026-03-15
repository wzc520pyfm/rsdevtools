export function formatDuration(ms: number | null | undefined): string[]
export function formatDuration(ms: number | null | undefined, stringify: true): string
export function formatDuration(ms: number | null | undefined, stringify: false): string[]
export function formatDuration(ms: number | null | undefined, stringify?: boolean): string | string[] {
  let duration = []

  if (ms == null)
    duration = ['', '-']
  else if (ms < 1)
    duration = ['<1', 'ms']
  else if (ms < 1000)
    duration = [ms.toFixed(0), 'ms']
  else if (ms < 1000 * 60)
    duration = [(ms / 1000).toFixed(1), 's']
  else
    duration = [(ms / 1000 / 60).toFixed(1), 'min']

  return stringify ? duration.join(' ') : duration
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function shortenPath(path: string): string {
  const nmIdx = path.lastIndexOf('node_modules')
  if (nmIdx !== -1) return path.slice(nmIdx)
  const parts = path.split('/')
  return parts.length > 3 ? `.../${parts.slice(-3).join('/')}` : path
}

export function getFileIcon(name: string): string {
  if (/\.jsx?$/.test(name)) return 'i-carbon-logo-javascript text-yellow-500'
  if (/\.tsx?$/.test(name)) return 'i-carbon-code text-blue-500'
  if (/\.css$/.test(name)) return 'i-carbon-color-palette text-blue-400'
  if (/\.s[ac]ss$/.test(name)) return 'i-carbon-color-palette text-pink-500'
  if (/\.less$/.test(name)) return 'i-carbon-color-palette text-indigo-500'
  if (/\.html?$/.test(name)) return 'i-carbon-html text-orange-500'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'i-carbon-image text-green-500'
  if (/\.(woff2?|ttf|eot)$/.test(name)) return 'i-carbon-text-font text-purple-500'
  if (/\.json$/.test(name)) return 'i-carbon-json text-yellow-600'
  if (/\.map$/.test(name)) return 'i-carbon-map text-gray-400'
  if (/\.vue$/.test(name)) return 'i-carbon-application text-green-600'
  return 'i-carbon-document text-gray-500'
}
