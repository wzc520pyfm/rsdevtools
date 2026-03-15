import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const NUXT_DEBUG_BUILD = !!process.env.NUXT_DEBUG_BUILD
const BASE = '/.devtools-rspack/'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],

  logLevel: 'verbose',
  srcDir: 'app',

  components: [
    '~/components',
    { path: fileURLToPath(new URL('../../ui/src/components', import.meta.url)), prefix: '' },
  ],

  experimental: {
    typedPages: true,
    clientNodeCompat: true,
  },

  features: {
    inlineStyles: false,
  },

  nitro: {
    minify: NUXT_DEBUG_BUILD ? false : undefined,
    preset: 'static',
    output: {
      dir: '../dist',
    },
    routeRules: {
      '/': {
        prerender: true,
      },
      '/200.html': {
        prerender: true,
      },
      '/404.html': {
        prerender: true,
      },
      '/**': {
        prerender: false,
      },
    },
    sourceMap: false,
  },

  unocss: {
    configFile: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
  },

  app: {
    baseURL: BASE,
    head: {
      title: 'Rspack DevTools',
      charset: 'utf-8',
      viewport: 'width=device-width,initial-scale=1',
      meta: [
        { name: 'description', content: 'DevTools for Rspack' },
        { property: 'og:title', content: 'Rspack DevTools' },
        { property: 'og:description', content: 'DevTools for Rspack' },
      ],
      htmlAttrs: {
        lang: 'en',
        class: 'bg-dots',
      },
    },
  },

  debug: false,

  vite: {
    base: BASE,
    build: {
      minify: NUXT_DEBUG_BUILD ? false : undefined,
      cssMinify: false,
    },
    optimizeDeps: {
      include: [
        '@vueuse/core',
        '@floating-ui/dom',
        'd3-hierarchy',
        'd3-shape',
        'fuse.js',
        'modern-monaco',
        'comlink',
        'floating-vue',
        'splitpanes',
        'vue-virtual-scroller',
        'nanovis',
      ],
      exclude: [
        'birpc',
      ],
    },
  },

  devtools: {
    enabled: false,
  },

  typescript: {
    includeWorkspace: true,
  },

  compatibilityDate: '2024-07-17',
})
