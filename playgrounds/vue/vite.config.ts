import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import movk from '@movk/nuxt/vite'

export default defineConfig({
  plugins: [
    vue(),
    movk({
      // 复用 Nuxt playground（playgrounds/play）的演示组件与 composables
      ui: {
        components: {
          dirs: ['../play/app/components']
        },
        autoImport: {
          dirs: ['../play/app/composables'],
          imports: ['vue']
        }
      }
    })
  ]
})
