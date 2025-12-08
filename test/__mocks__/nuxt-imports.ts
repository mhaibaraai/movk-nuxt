import { vi } from 'vitest'
import { ref } from 'vue'

// Mock useNuxtApp
export const useNuxtApp = vi.fn(() => ({
  $api: {
    $fetch: vi.fn(),
    use: vi.fn(),
    getConfig: vi.fn()
  }
}))

// Mock useFetch
export const useFetch = vi.fn((_url, _options) => {
  const data = ref(null)
  const pending = ref(false)
  const error = ref(null)
  const refresh = vi.fn()

  return {
    data,
    pending,
    error,
    refresh,
    execute: vi.fn()
  }
})

// Export other Nuxt composables as needed
export const useRuntimeConfig = vi.fn()
export const navigateTo = vi.fn()
