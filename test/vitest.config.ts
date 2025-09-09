import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    typecheck: {
      enabled: true,
      tsconfig: '../tsconfig.json',
      include: ['**/*.test-d.ts'],
    },
  },
  resolve: {
    alias: {
      '#components': resolve(__dirname, '../src/runtime/components'),
      '~': resolve(__dirname, '..'),
    },
  },
  esbuild: {
    target: 'node18',
  },
})
