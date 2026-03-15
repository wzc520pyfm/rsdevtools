import FloatingVue from 'floating-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(FloatingVue, {
    themes: {
      tooltip: {
        delay: { show: 300, hide: 0 },
      },
    },
  })
})
