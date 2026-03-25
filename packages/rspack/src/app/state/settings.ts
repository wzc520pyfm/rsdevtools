import type { RemovableRef } from '@vueuse/core'
import type { Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface ClientSettings {
  chartAnimation: boolean
  showNodeModules: boolean
  compactMode: boolean
  wordWrap: boolean
  moduleGraphViewType: 'list' | 'detailed-list' | 'graph' | 'folder'
  assetViewType: 'list' | 'folder' | 'treemap' | 'sunburst' | 'flamegraph'
}

export const settings = useLocalStorage<ClientSettings>('rspack-devtools-settings', {
  chartAnimation: true,
  showNodeModules: true,
  compactMode: false,
  wordWrap: false,
  moduleGraphViewType: 'list',
  assetViewType: 'list',
}, {
  mergeDefaults: true,
})

export function objectRefToRefs<T extends object>(obj: RemovableRef<T>): {
  [K in keyof T]: Ref<T[K]>
} {
  const cache = new Map<keyof T, Ref<T[keyof T]>>()
  return new Proxy(obj.value, {
    get(target, prop) {
      if (!cache.has(prop as keyof T)) {
        cache.set(prop as keyof T, computed({
          get() {
            return target[prop as keyof T]
          },
          set(value) {
            target[prop as keyof T] = value
          },
        }))
      }
      return cache.get(prop as keyof T)
    },
  }) as any
}

export const settingsRefs = objectRefToRefs(settings)
