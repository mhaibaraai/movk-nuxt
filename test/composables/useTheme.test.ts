import { expect, it, vi } from 'vitest'
import { ref } from 'vue'

const useLocalStorage = vi.fn((_key: string, value: unknown) => ref(value))
const useSiteConfig = vi.fn<() => { name?: string }>()

vi.mock('#imports', () => ({
  useAppConfig: () => ({ ui: { colors: { primary: 'blue', neutral: 'slate' }, icons: {} } }),
  useColorMode: () => ({ value: 'light' }),
  useSiteConfig
}))

vi.mock('@vueuse/core', () => ({ useLocalStorage }))

const { useTheme } = await import('../../src/runtime/composables/useTheme')

it.each([
  [{}, 'movk'],
  [{ name: 'Movk Nuxt' }, 'movk-nuxt']
])('uses the expected storage prefix with site config %j', (site, prefix) => {
  useLocalStorage.mockClear()
  useSiteConfig.mockReturnValue(site)

  useTheme()

  expect(useLocalStorage.mock.calls.map(([key]) => key)).toEqual([
    `${prefix}-ui-radius`,
    `${prefix}-ui-icons`,
    `${prefix}-ui-black-as-primary`
  ])
})
