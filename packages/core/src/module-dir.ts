import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Present when this file is emitted/loaded as CommonJS (Node sets it on the module). */
declare const __filename: string | undefined

/**
 * Directory containing this module. Prefer `__filename` so CJS builds do not depend on
 * bundler `import.meta.url` shims (unreliable under WASI, eval, or some sandboxes).
 */
export const moduleDirname: string = path.dirname(
  typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url),
)
