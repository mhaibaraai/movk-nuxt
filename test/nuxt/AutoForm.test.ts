import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive, ref } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AutoForm from '../../src/runtime/components/AutoForm.vue'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'

const { afz } = useAutoForm()

const flat = { collapsible: { enabled: false } }

const mounted: Array<{ unmount: () => void }> = []

async function mountForm(props: Record<string, unknown>) {
  const wrapper = await mountSuspended(AutoForm, { props: props as never, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

function addButtons(root: Element) {
  return Array.from(root.querySelectorAll('button')).filter(b => b.textContent?.trim() === 'Add')
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('AutoForm', () => {
  it('toggle 按钮在 true 和 false 之间切换', async () => {
    const schema = afz.object({
      pinned: afz.boolean({ type: 'toggle', controlProps: { label: 'Pin' } })
    })
    const state = reactive({ pinned: false })
    const wrapper = await mountForm({ schema, modelValue: state })
    const button = wrapper.get('button[aria-pressed="false"]')

    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(state.pinned).toBe(true)

    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(state.pinned).toBe(false)
  })

  it('toggleGroup 从枚举生成选项并校验取消单选后的值', async () => {
    enum Period { Day, Week }
    const schema = afz.object({
      period: afz.enum(Period, { type: 'toggleGroup' })
    })
    const state = reactive<{ period?: Period }>({ period: Period.Day })
    const wrapper = await mountForm({ schema, modelValue: state })
    const buttons = wrapper.get('[role="group"]').findAll('button')
    const week = buttons[1]!
    const vm = wrapper.vm as unknown as { validate: () => Promise<unknown> }

    expect(buttons.map(button => button.text())).toEqual(['0', '1'])
    expect(buttons[0]!.attributes('aria-pressed')).toBe('true')
    await week.trigger('click')
    expect(week.attributes('aria-pressed')).toBe('true')
    await expect(vm.validate()).resolves.toEqual({ period: Period.Week })

    await week.trigger('click')
    expect(week.attributes('aria-pressed')).toBe('false')
    expect(state.period).toBeUndefined()
    await expect(vm.validate()).rejects.toMatchObject({ errors: [{ name: 'period' }] })
  })

  it('toggleGroup 多选提交数组', async () => {
    const schema = afz.object({
      formats: afz.array(afz.string(), {
        type: 'toggleGroup',
        controlProps: {
          type: 'multiple',
          items: [{ label: 'Bold', value: 'bold' }, { label: 'Italic', value: 'italic' }]
        }
      })
    })
    const state = reactive({ formats: [] as string[] })
    const onSubmit = vi.fn()
    const wrapper = await mountForm({ schema, modelValue: state, onSubmit })
    const [bold, italic] = wrapper.get('[role="group"]').findAll('button')
    const vm = wrapper.vm as unknown as { submit: () => Promise<void> }

    await bold!.trigger('click')
    await italic!.trigger('click')
    await vm.submit()
    expect(onSubmit.mock.calls[0]?.[0].data).toEqual({ formats: ['bold', 'italic'] })

    await bold!.trigger('click')
    expect(state.formats).toEqual(['italic'])
  })

  it('toggleGroup 的响应式选项覆盖枚举默认选项', async () => {
    const items = ref([{ label: 'Every day', value: 'day' }])
    const schema = afz.object({
      period: afz.enum(['day', 'week'], { type: 'toggleGroup', controlProps: () => ({ items: items.value }) }).optional()
    })
    const state = reactive<{ period?: 'day' | 'week' }>({})
    const wrapper = await mountForm({ schema, modelValue: state })
    const group = wrapper.get('[role="group"]')

    expect(group.findAll('button').map(button => button.text())).toEqual(['Every day'])

    items.value = [{ label: 'Every week', value: 'week' }]
    await nextTick()
    const button = group.get('button')
    expect(button.text()).toBe('Every week')
    await button.trigger('click')
    expect(state.period).toBe('week')
    await button.trigger('click')
    expect(state.period).toBeUndefined()

    items.value = []
    await nextTick()
    expect(group.findAll('button')).toHaveLength(0)
  })

  it('toggleGroup 的异步选项覆盖枚举默认选项', async () => {
    const schema = afz.object({
      period: afz.enum(['day', 'week'], { type: 'toggleGroup' }).meta({
        asyncItems: { load: async () => [{ label: 'Every week', value: 'week' }] }
      })
    })
    const wrapper = await mountForm({ schema, modelValue: {} })
    const group = wrapper.get('[role="group"]')

    await vi.waitFor(() => {
      expect(group.findAll('button').map(button => button.text())).toEqual(['Every week'])
    })
  })

  it('异步日期控件渲染后可提交日期值', async () => {
    const schema = afz.object({ day: afz.calendarDate() })
    const day = new CalendarDate(2026, 11, 20)
    const onSubmit = vi.fn()
    const wrapper = await mountForm({ schema, modelValue: { day }, onSubmit })
    await vi.waitFor(() => expect(wrapper.text()).toContain('2026'))
    const vm = wrapper.vm as unknown as { submit: () => Promise<void> }
    await vm.submit()
    expect(onSubmit.mock.calls[0]?.[0].data.day.toString()).toBe('2026-11-20')
  })

  it('根 schema 带 refine 且字段被 if 隐藏时正常渲染', async () => {
    const schema = afz.object({
      mode: afz.string(),
      secret: afz.string().meta({ if: false })
    }).refine(v => v.mode !== 'x', { message: 'bad' })

    const wrapper = await mountForm({ schema, state: reactive({}) })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('secret')
  })

  it('对象内的数组项渲染删除按钮', async () => {
    const schema = afz.object({
      user: afz.object({
        tags: afz.array(afz.string())
      })
    })
    const state = reactive({ user: { tags: ['a', 'b'] } })

    const wrapper = await mountForm({ schema, state, globalMeta: flat })

    const deleteButtons = wrapper.findAll('button').filter(b => b.html().includes('trash'))
    expect(deleteButtons).toHaveLength(2)

    await deleteButtons[0]!.trigger('click')
    expect(state.user.tags).toEqual(['b'])
  })

  it('嵌套数组添加项写入对应索引的路径', async () => {
    const schema = afz.object({
      list: afz.array(afz.object({
        sub: afz.array(afz.string())
      }))
    })
    const state = reactive<{ list: Array<{ sub?: string[] }> }>({ list: [{ sub: [] }, { sub: [] }] })

    const wrapper = await mountForm({ schema, state, globalMeta: flat })
    await nextTick()

    // 第 0 个为外层添加按钮之外的第一个内层添加按钮
    const inner = addButtons(wrapper.element)
    expect(inner.length).toBeGreaterThanOrEqual(3)
    inner[1]!.click()
    await nextTick()

    expect(state.list[1]?.sub).toHaveLength(1)
    expect(state.list[0]?.sub).toHaveLength(0)
    expect(Object.keys(state)).toEqual(['list'])
  })

  it('v-model：reset 原地恢复基线并应用默认值，clear 只保留默认值，均 emit 状态快照', async () => {
    const schema = afz.object({
      name: afz.string(),
      role: afz.string().default('user')
    })
    const state = reactive<Record<string, any>>({ name: 'a' })
    const wrapper = await mountForm({ schema, modelValue: state })
    const vm = wrapper.vm as unknown as { reset: () => void, clear: () => void, setFieldValue: (p: string, v: unknown) => void }

    vm.setFieldValue('name', 'changed')
    vm.reset()
    expect(state).toEqual({ name: 'a', role: 'user' })
    expect(wrapper.emitted('reset')?.[0]?.[0]).toEqual({ name: 'a', role: 'user' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    vm.clear()
    expect(state).toEqual({ role: 'user' })
    expect(wrapper.emitted('clear')?.[0]?.[0]).toEqual({ role: 'user' })
  })

  it('isDirty 与 dirtyFields 相对基线计算，setBaseline 后归零', async () => {
    const schema = afz.object({
      name: afz.string(),
      profile: afz.object({ phone: afz.string() })
    })
    const state = reactive<Record<string, any>>({ name: 'a', profile: { phone: '1' } })
    const wrapper = await mountForm({ schema, modelValue: state })
    const vm = wrapper.vm as unknown as { isDirty: boolean, dirtyFields: string[], setBaseline: () => void }

    expect(vm.isDirty).toBe(false)
    state.profile.phone = '2'
    await nextTick()
    expect(vm.dirtyFields).toEqual(['profile.phone'])

    vm.setBaseline()
    await nextTick()
    expect(vm.isDirty).toBe(false)
  })

  it('嵌套对象中被 if 隐藏的字段不参与校验', async () => {
    const schema = afz.object({
      profile: afz.object({
        phone: afz.string().meta({ if: false }),
        email: afz.string()
      })
    })
    const wrapper = await mountForm({ schema, modelValue: { profile: { email: 'e' } } })
    const vm = wrapper.vm as unknown as { validate: (o?: unknown) => Promise<unknown> }

    await expect(vm.validate()).resolves.toEqual({ profile: { email: 'e' } })
  })

  it('hiddenValue: clear 在字段被隐藏时清除其值', async () => {
    const schema = afz.object({
      type: afz.string(),
      detail: afz.string().meta({ if: ({ state }: { state: Record<string, unknown> }) => state.type === 'a' })
    })
    const state = reactive<Record<string, any>>({ type: 'a', detail: 'x' })
    await mountForm({ schema, modelValue: state, hiddenValue: 'clear' })

    state.type = 'b'
    await nextTick()
    await nextTick()
    expect(state.detail).toBeUndefined()
  })

  it('已废弃的 state prop 仍原地修改父对象', async () => {
    const schema = afz.object({ name: afz.string() })
    const state = reactive<Record<string, any>>({ name: 'a' })
    const wrapper = await mountForm({ schema, state })
    const vm = wrapper.vm as unknown as { clear: () => void }

    vm.clear()
    expect(state).toEqual({})
  })

  it('数组 sortable / duplicable 渲染操作按钮，min 限制删除、max 限制添加', async () => {
    const schema = afz.object({
      tags: afz.array(afz.string()).min(1).max(3).meta({ sortable: true, duplicable: true })
    })
    const state = reactive({ tags: ['a', 'b'] })
    const wrapper = await mountForm({ schema, modelValue: state, globalMeta: flat })
    const byLabel = (label: string) => wrapper.findAll(`button[aria-label="${label}"]`)

    await byLabel('Move down')[0]!.trigger('click')
    expect(state.tags).toEqual(['b', 'a'])

    await byLabel('Duplicate')[0]!.trigger('click')
    expect(state.tags).toEqual(['b', 'b', 'a'])
    await nextTick()
    expect(addButtons(wrapper.element)[0]!.hasAttribute('disabled')).toBe(true)

    await byLabel('Remove')[0]!.trigger('click')
    await byLabel('Remove')[0]!.trigger('click')
    expect(state.tags).toEqual(['a'])
    await nextTick()
    expect(byLabel('Remove')[0]!.attributes('disabled')).toBeDefined()
  })

  it('asyncItems 加载结果注入控件 items', async () => {
    const schema = afz.object({
      city: afz.string().meta({
        type: 'selectMenu',
        asyncItems: { load: async () => ['Beijing', 'Shanghai'] }
      }).optional()
    })
    const wrapper = await mountForm({ schema, modelValue: {} })
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    const control = wrapper.findAllComponents({ name: 'USelectMenu' })[0] ?? wrapper.findAllComponents({ name: 'SelectMenu' })[0]
    expect(control?.props('items')).toEqual(['Beijing', 'Shanghai'])
  })
})
