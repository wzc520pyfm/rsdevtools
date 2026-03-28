import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
    'src/server.ts',
    'src/presets/index.ts',
    'src/presets/ws/client.ts',
    'src/presets/ws/server.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['ws'],
})
