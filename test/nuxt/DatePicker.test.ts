import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DatePicker from '../../src/runtime/components/DatePicker.vue'

const mounted: Array<{ unmount: () => void }> = []

async function mountPicker(props: Record<string, unknown>) {
  const wrapper = await mountSuspended(DatePicker, { props: props as never, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('DatePicker', () => {
  it('disabled 作用于触发按钮，class 落在触发按钮上', async () => {
    const wrapper = await mountPicker({ disabled: true, class: 'my-picker' })
    const trigger = wrapper.find('button')
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.classes()).toContain('my-picker')
  })

  it('labelFormat: date 在负时区不偏移一天', async () => {
    const wrapper = await mountPicker({
      modelValue: new CalendarDate(2025, 3, 1),
      labelFormat: 'date',
      locale: 'en-US',
      timeZone: 'America/Los_Angeles'
    })
    expect(wrapper.find('button').text()).toContain('3/1/2025')
  })

  it('buttonProps.label 不覆盖已选日期，只作为空值文案', async () => {
    const empty = await mountPicker({ buttonProps: { label: 'Pick' } })
    expect(empty.find('button').text()).toContain('Pick')

    const filled = await mountPicker({ buttonProps: { label: 'Pick' }, modelValue: new CalendarDate(2025, 1, 2), locale: 'en-US' })
    expect(filled.find('button').text()).toContain('2025')
  })

  it('清除范围值得到 undefined', async () => {
    const wrapper = await mountPicker({
      range: true,
      clearable: true,
      modelValue: { start: new CalendarDate(2025, 1, 1), end: new CalendarDate(2025, 1, 2) }
    })
    await wrapper.find('button[aria-label="Clear"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
  })

  it('expose open / close 驱动 v-model:open', async () => {
    const wrapper = await mountPicker({})
    const vm = wrapper.vm as unknown as { open: () => void, close: () => void }
    vm.open()
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    vm.close()
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('month 模式只显示年月', async () => {
    const wrapper = await mountPicker({ type: 'month', modelValue: new CalendarDate(2025, 3, 1), locale: 'en-US' })
    expect(wrapper.find('button').text()).toBe('March 2025')
  })
})
