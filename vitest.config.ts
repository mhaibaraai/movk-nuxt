import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/runtime/utils/**/*.ts',
        'src/runtime/composables/**/*.ts'
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/types/**'
      ]
    }
  },
  resolve: {
    alias: {
      '#imports': resolve(__dirname, './test/__mocks__/nuxt-imports.ts'),
      '#app': resolve(__dirname, './test/__mocks__/nuxt-app.ts'),
      '@movk/core': resolve(__dirname, './test/__mocks__/movk-core.ts')
    }
  }
})
