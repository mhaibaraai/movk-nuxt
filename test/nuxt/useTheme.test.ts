import colors from 'tailwindcss/colors'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useTheme } from '../../src/runtime/composables/useTheme'

const mounted: Array<{ unmount: () => void }> = []

async function mountTheme() {
  let theme!: ReturnType<typeof useTheme>
  const wrapper = await mountSuspended(defineComponent({
    setup() {
      theme = useTheme()
      return () => h('div')
    }
  }))
  mounted.push(wrapper)
  return { wrapper, theme }
}

const root = () => document.documentElement.style

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  localStorage.clear()
  document.documentElement.removeAttribute('style')
})

describe('useTheme 色板', () => {
  it('两个主题入口同步选择，任一入口重置后都回到 CSS 默认值', async () => {
    const { theme: header } = await mountTheme()
    const { theme: example } = await mountTheme()

    header.primary.value = 'blue'
    header.neutral.value = 'zinc'
    await nextTick()
    await nextTick()
    expect(example.primary.value).toBe('blue')
    expect(example.neutral.value).toBe('zinc')
    expect(root().getPropertyValue('--ui-color-primary-500')).toBe(colors.blue[500])

    example.resetTheme()
    await nextTick()
    await nextTick()
    expect(header.primary.value).toBeUndefined()
    expect(header.neutral.value).toBeUndefined()
    expect(root().getPropertyValue('--ui-color-primary-500')).toBe('')
    expect(root().getPropertyValue('--ui-color-neutral-500')).toBe('')
  })

  it('切换圆角和黑白主色后移除首屏恢复的内联变量', async () => {
    root().setProperty('--ui-radius', '1rem')
    root().setProperty('--ui-primary', 'black')
    const { theme } = await mountTheme()

    theme.radius.value = 0.5
    theme.setBlackAsPrimary(true)
    await nextTick()
    expect(root().getPropertyValue('--ui-radius')).toBe('')
    expect(root().getPropertyValue('--ui-primary')).toBe('')

    root().setProperty('--ui-radius', '1rem')
    root().setProperty('--ui-primary', 'black')
    theme.resetTheme()
    await nextTick()
    expect(root().getPropertyValue('--ui-radius')).toBe('')
    expect(root().getPropertyValue('--ui-primary')).toBe('')
  })

  it('未选择时不写入变量，沿用 CSS 配置', async () => {
    const { theme } = await mountTheme()
    expect(theme.primary.value).toBeUndefined()
    expect(root().getPropertyValue('--ui-color-primary-500')).toBe('')
    expect(theme.hasCSSChanges.value).toBe(false)
  })

  it('切换主色与中性色时写入 <html> 并持久化变量表', async () => {
    const { theme } = await mountTheme()
    theme.primary.value = 'green'
    theme.neutral.value = 'zinc'
    await nextTick()

    expect(root().getPropertyValue('--ui-color-primary-500')).toBe(colors.green[500])
    expect(root().getPropertyValue('--ui-color-neutral-900')).toBe(colors.zinc[900])
    expect(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.endsWith('-ui-colors'))!)!))
      .toHaveProperty('--ui-color-primary-500', colors.green[500])
    expect(theme.exportCSS()).toContain('@plugin "@nuxt/ui/colors" {\n  primary: green;\n  neutral: zinc;\n}')
  })

  it('重置后移除变量与存储', async () => {
    const { theme } = await mountTheme()
    theme.primary.value = 'red'
    await nextTick()
    theme.resetTheme()
    await nextTick()

    expect(root().getPropertyValue('--ui-color-primary-500')).toBe('')
    expect(Object.keys(localStorage).some(k => k.endsWith('-ui-colors'))).toBe(false)
    expect(theme.exportConfig()).not.toContain('colors')
  })
})
