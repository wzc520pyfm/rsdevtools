import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/dirs.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: false,
  external: ['@rspack/core', '@rspack-devtools/kit', '@rspack-devtools/rpc'],
})
