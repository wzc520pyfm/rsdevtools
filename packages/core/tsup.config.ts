import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    /** CJS needs shims for `import.meta.url` / `createRequire(import.meta.url)` in server & plugin */
    shims: true,
    external: [
      '@rspack/core',
      '@rspack-devtools/kit',
      '@rspack-devtools/rpc',
      '@rspack-devtools/rspack',
      '@rspack-devtools/self-inspect',
      '@rsdoctor/rspack-plugin',
    ],
  },
  {
    entry: { 'client-inject': 'src/client-inject/index.ts' },
    format: ['iife'],
    outDir: 'dist',
    dts: false,
    clean: false,
    target: 'es2020',
    treeshake: true,
  },
])
