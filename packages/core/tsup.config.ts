import { defineConfig } from 'tsup'

export default defineConfig({
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
})
