import { ref, watchEffect } from 'vue'

const isDark = ref(false)

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mq.matches
  mq.addEventListener('change', e => { isDark.value = e.matches })

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })
}

export function useDark() {
  return {
    isDark,
    toggle: () => { isDark.value = !isDark.value },
  }
}
