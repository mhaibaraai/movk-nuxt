import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/**/*.test.ts'],
          exclude: ['test/nuxt/**']
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL('./playgrounds/play', import.meta.url)),
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ],
    coverage: {
      provider: 'v8',
      include: ['src/runtime/**'],
      exclude: ['src/runtime/vue/stubs/**', 'src/runtime/**/*.d.ts']
    }
  }
})
