<script setup lang="ts">
import { getMonaco, applyMonacoTheme, setupMonacoScrollSync, createReadOnlyMonacoEditor } from '../../composables/monaco'
import { isDark } from '@rspack-devtools/ui/composables/dark'

const props = defineProps<{
  original: string
  modified: string
  filename?: string
  language?: string
}>()

const containerLeft = ref<HTMLElement>()
const containerRight = ref<HTMLElement>()

function guessLanguage(filename: string): string {
  if (/\.tsx?$/.test(filename)) return 'typescript'
  if (/\.jsx?$/.test(filename)) return 'javascript'
  if (/\.css$/.test(filename)) return 'css'
  if (/\.json$/.test(filename)) return 'json'
  if (/\.html?$/.test(filename)) return 'html'
  if (/\.vue$/.test(filename)) return 'html'
  return 'plaintext'
}

onMounted(async () => {
  if (!containerLeft.value || !containerRight.value) return
  try {
    const monaco = await getMonaco()
    const lang = props.language || guessLanguage(props.filename || '')

    const editorLeft = createReadOnlyMonacoEditor(monaco, containerLeft.value, {
      value: props.original,
      language: lang,
    })

    const editorRight = createReadOnlyMonacoEditor(monaco, containerRight.value, {
      value: props.modified,
      language: lang,
    })

    applyMonacoTheme(monaco)
    setupMonacoScrollSync(editorLeft, editorRight)

    watch(isDark, () => {
      applyMonacoTheme(monaco)
    })
  }
  catch (e) {
    console.warn('Failed to initialize Monaco diff editor:', e)
  }
})
</script>

<template>
  <div flex="~ gap-1" w-full h-400px>
    <div flex="~ col" flex-1>
      <div text-xs op50 px2 py1 border="b base">
        Original
      </div>
      <div ref="containerLeft" flex-1 border="~ base" rounded-bl-lg of-hidden />
    </div>
    <div flex="~ col" flex-1>
      <div text-xs op50 px2 py1 border="b base">
        Modified
      </div>
      <div ref="containerRight" flex-1 border="~ base" rounded-br-lg of-hidden />
    </div>
  </div>
</template>
