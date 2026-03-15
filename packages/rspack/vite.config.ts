import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  root: resolve(__dirname, 'src/app'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/app'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'client'),
    emptyOutDir: true,
  },
})
