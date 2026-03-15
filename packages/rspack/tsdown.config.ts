import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    dirs: 'src/dirs.ts',
  },
  target: 'esnext',
  exports: true,
  dts: true,
  clean: false,
})
