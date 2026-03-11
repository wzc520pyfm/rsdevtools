import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: {
    'btn': 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    'btn-ghost': 'btn hover:bg-gray-100 dark:hover:bg-gray-800',
    'card': 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg',
    'input-base': 'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'badge': 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
    'badge-blue': 'badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'badge-green': 'badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'badge-yellow': 'badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'badge-red': 'badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'badge-gray': 'badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
  },
})
