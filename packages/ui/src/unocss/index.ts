import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import type { Theme } from '@unocss/preset-wind4'
import {
  definePreset,
  mergeDeep,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { shortcuts } from './shortcuts'
import { theme } from './theme'

export interface PresetDevToolsUIOptions {
  webFonts?: WebFontsOptions
  icons?: Parameters<typeof presetIcons>[0]
}

export const presetDevToolsUI = definePreset<PresetDevToolsUIOptions, Theme>((options) => {
  return {
    name: '@rspack-devtools/ui/preset',
    shortcuts,
    extendTheme(defaultTheme) {
      return mergeDeep(defaultTheme, theme)
    },
    presets: [
      presetWind4(),
      presetAttributify(),
      presetIcons({
        scale: 1.2,
        ...options?.icons,
      }),
      presetTypography(),
      presetWebFonts(mergeDeep(
        {
          fonts: {
            sans: 'DM Sans:200,400,700',
            mono: 'DM Mono',
          },
        },
        options?.webFonts ?? {},
      )),
    ],
    transformers: [
      transformerDirectives(),
      transformerVariantGroup(),
    ],
  }
})
