import { createRequire } from 'node:module'
import { presetDevToolsUI } from '@rspack-devtools/ui/unocss'
import { defineConfig } from 'unocss'

const require = createRequire(import.meta.url)

export default defineConfig({
  presets: [
    presetDevToolsUI({
      icons: {
        collections: {
          ph: () => require('@iconify-json/ph/icons.json'),
          'svg-spinners': () => require('@iconify-json/svg-spinners/icons.json'),
        },
      },
    }),
  ],
})
