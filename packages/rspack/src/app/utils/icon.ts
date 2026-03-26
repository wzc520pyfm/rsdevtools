import { makeCachedFunction } from './cache'

export interface FilterMatchRule {
  match: RegExp
  name: string
  description: string
  icon: string
}

// @unocss-include
export const ModuleTypeRules: FilterMatchRule[] = [
  {
    match: /[\\/]node_modules[\\/]/i,
    name: 'node_modules',
    description: 'Node Modules',
    icon: 'i-catppuccin-npm',
  },
  {
    match: /virtual:|^\0/,
    name: 'virtual',
    description: 'Virtual',
    icon: 'i-catppuccin-symlink',
  },
  {
    match: /\.vue$/i,
    name: 'vue',
    description: 'Vue',
    icon: 'i-catppuccin-vue',
  },
  {
    match: /\.[cm]?[tj]sx$/i,
    name: 'jsx',
    description: 'JavaScript React',
    icon: 'i-catppuccin-javascript-react',
  },
  {
    match: /\.[cm]?ts$/i,
    name: 'ts',
    description: 'TypeScript',
    icon: 'i-catppuccin-typescript',
  },
  {
    match: /\.[cm]?js$/i,
    name: 'js',
    description: 'JavaScript',
    icon: 'i-catppuccin-javascript',
  },
  {
    match: /\.svelte$/i,
    name: 'svelte',
    description: 'Svelte',
    icon: 'i-catppuccin-svelte',
  },
  {
    match: /\.html?$/i,
    name: 'html',
    description: 'HTML',
    icon: 'i-catppuccin-html',
  },
  {
    match: /\.(css|scss|less|postcss)$/i,
    name: 'css',
    description: 'CSS',
    icon: 'i-catppuccin-css',
  },
  {
    match: /\.json[c5]?$/i,
    name: 'json',
    description: 'JSON',
    icon: 'i-catppuccin-json',
  },
  {
    match: /\.(yaml|yml)$/i,
    name: 'yaml',
    description: 'YAML',
    icon: 'i-catppuccin-yaml',
  },
  {
    match: /\.svg$/i,
    name: 'svg',
    description: 'SVG',
    icon: 'i-catppuccin-svg',
  },
]

export const DefaultFileTypeRule: FilterMatchRule = {
  name: 'file',
  match: /.*/,
  description: 'File',
  icon: 'i-catppuccin-file',
}

export function getFileTypeFromName(name: string) {
  return ModuleTypeRules.find(rule => rule.name === name) ?? DefaultFileTypeRule
}

export const getFileTypeFromModuleId = makeCachedFunction((moduleId: string): FilterMatchRule => {
  moduleId = moduleId
    .replace(/(\?|&)v=[^&]*/, '$1')
    .replace(/\?$/, '')

  for (const rule of ModuleTypeRules) {
    if (rule.match.test(moduleId)) {
      return rule
    }
  }

  return DefaultFileTypeRule
})

// @unocss-include
export const PluginTypeRules: FilterMatchRule[] = [
  {
    match: /Rspack/i,
    name: 'rspack',
    description: 'Rspack',
    icon: 'i-catppuccin-folder-prisma',
  },
]

export const DefaultPluginType: FilterMatchRule = {
  name: 'plugin',
  match: /.*/,
  description: 'User Plugins',
  icon: 'i-catppuccin-folder-plugins',
}

export const getPluginTypeFromName = makeCachedFunction((name: string): FilterMatchRule => {
  for (const rule of PluginTypeRules) {
    if (rule.match.test(name)) {
      return rule
    }
  }
  return DefaultPluginType
})

export function getChunkTypeIcon(entry: boolean, initial: boolean): string {
  if (entry) return 'i-ph-house-duotone text-green-500'
  if (initial) return 'i-ph-flag-duotone text-blue-500'
  return 'i-ph-stack-duotone text-gray-500'
}
