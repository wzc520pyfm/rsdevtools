import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    external: [
      '@rspack/core',
      '@rspack-devtools/kit',
      '@rspack-devtools/rpc',
      '@rspack-devtools/rspack',
      '@rspack-devtools/self-inspect',
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
