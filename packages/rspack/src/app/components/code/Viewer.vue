<script setup lang="ts">
import { getMonaco, createReadOnlyMonacoEditor, applyMonacoTheme } from '../../composables/monaco'
import { isDark } from '@rspack-devtools/ui/composables/dark'

const props = defineProps<{
  code: string
  filename?: string
  language?: string
}>()

const container = ref<HTMLElement>()

function guessLanguage(filename: string): string {
  if (/\.tsx?$/.test(filename)) return 'typescript'
  if (/\.jsx?$/.test(filename)) return 'javascript'
  if (/\.css$/.test(filename)) return 'css'
  if (/\.json$/.test(filename)) return 'json'
  if (/\.html?$/.test(filename)) return 'html'
  if (/\.vue$/.test(filename)) return 'html'
  return 'plaintext'
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

onMounted(async () => {
  if (!container.value) return
  try {
    const monaco = await getMonaco()
    const lang = props.language || guessLanguage(props.filename || '')
    const editor = createReadOnlyMonacoEditor(monaco, container.value, {
      value: props.code,
      language: lang,
    })
    applyMonacoTheme(monaco)

    watch(isDark, () => {
      applyMonacoTheme(monaco)
    })
  }
  catch {
    if (container.value) {
      container.value.innerHTML = `<pre style="padding:16px;font-size:12px;overflow:auto">${escapeHtml(props.code)}</pre>`
    }
  }
})
</script>

<template>
  <div ref="container" w-full h-400px border="~ base" rounded-lg of-hidden />
</template>
