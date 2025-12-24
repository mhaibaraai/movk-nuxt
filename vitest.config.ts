import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
      // Mock Nuxt runtime only
      '#imports': resolve(__dirname, './test/__mocks__/nuxt-imports.ts'),
      '#app': resolve(__dirname, './test/__mocks__/nuxt-app.ts'),
      '#components': resolve(__dirname, './test/__mocks__/components.ts')
      // Use real @movk/core package for better integration testing
    }
  }
})
