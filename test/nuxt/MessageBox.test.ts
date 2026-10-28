import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UApp } from '#components'
import { zh_cn } from '@nuxt/ui/locale'
import MessageBox from '../../src/runtime/components/MessageBox.vue'
import { extendMovkLocale } from '../../src/runtime/composables/useMovkLocale'

const mounted: Array<{ unmount: () => void }> = []

// Nuxt UI 的 useLocale 在客户端是 shared composable，须卸载上一个实例，否则会沿用其注入的 locale
async function mountInApp(locale: unknown, props: Record<string, unknown>) {
  const wrapper = await mountSuspended(defineComponent({
    render: () => h(UApp, { locale }, () => h(MessageBox, { open: true, ...props }))
  }), { attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

function buttonLabels() {
  return Array.from(document.body.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean)
}

describe('MessageBox', () => {
  afterEach(() => {
    mounted.splice(0).forEach(wrapper => wrapper.unmount())
    document.body.innerHTML = ''
  })

  it('未设置 locale 时默认英文文案', async () => {
    await mountInApp(undefined, { mode: 'confirm' })
    expect(document.body.textContent).toContain('Notice')
    expect(buttonLabels()).toEqual(expect.arrayContaining(['Cancel', 'Confirm']))
  })

  it('跟随 UApp locale 切换为中文', async () => {
    await mountInApp(zh_cn, { mode: 'alert' })
    expect(document.body.textContent).toContain('提示')
    expect(buttonLabels()).toContain('知道了')
  })

  it('locale.messages.movk 覆盖内置文案，prop 优先于 locale', async () => {
    const locale = extendMovkLocale(zh_cn, { messageBox: { confirm: '好的' } })
    await mountInApp(locale, { mode: 'confirm', cancelLabel: '算了' })
    expect(buttonLabels()).toEqual(expect.arrayContaining(['好的', '算了']))
  })
})
