import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client/index.ts',
    'src/utils/events.ts',
    'src/utils/nanoid.ts',
    'src/constants.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['@rspack/core'],
})
