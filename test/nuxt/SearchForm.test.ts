import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SearchForm from '../../src/runtime/components/SearchForm.vue'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'

const { afz } = useAutoForm()

const mounted: Array<{ unmount: () => void }> = []

async function mountForm(props: Record<string, unknown>) {
  const wrapper = await mountSuspended(SearchForm, { props: props as never, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('SearchForm', () => {
  it('自定义 action 的 onClick 只调用一次，且不把 visible/key 透传给按钮', async () => {
    const onClick = vi.fn()
    const schema = afz.object({ keyword: afz.string().optional() })
    const wrapper = await mountForm({
      schema,
      actions: [{ key: 'export', label: 'Export', visible: true, onClick }]
    })

    const button = wrapper.findAll('button').find(b => b.text() === 'Export')!
    expect(button.attributes('visible')).toBeUndefined()
    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0]?.[0]).toHaveProperty('reset')
  })

  it('if 隐藏的字段不渲染也不参与校验', async () => {
    const schema = afz.object({
      keyword: afz.string().optional(),
      secret: afz.string().meta({ if: false })
    })
    const wrapper = await mountForm({ schema, modelValue: {} })

    expect(wrapper.html()).not.toContain('Secret')
    const vm = wrapper.vm as unknown as { validate: () => Promise<unknown> }
    await expect(vm.validate()).resolves.toEqual({})
  })

  it('reset 以基线加默认值重建，并 emit 覆盖全部字段的载荷', async () => {
    const schema = afz.object({
      keyword: afz.string().optional(),
      status: afz.string().default('all')
    })
    const wrapper = await mountForm({ schema, modelValue: { keyword: 'a' } })
    const vm = wrapper.vm as unknown as { reset: () => void, setFieldValue: (p: string, v: unknown) => void }

    vm.setFieldValue('keyword', 'b')
    vm.reset()

    expect(wrapper.emitted('reset')?.[0]?.[0]).toEqual({ keyword: 'a', status: 'all' })
  })

  it('对象字段被跳过，叶子字段正常渲染', async () => {
    const schema = afz.object({
      keyword: afz.string().optional(),
      range: afz.object({ from: afz.string() })
    })
    const wrapper = await mountForm({ schema })

    expect(wrapper.html()).toContain('Keyword')
    expect(wrapper.html()).not.toContain('From')
  })

  it('toggle 只 emit 一次 update:expanded', async () => {
    const schema = afz.object({
      a: afz.string().optional(),
      b: afz.string().optional(),
      c: afz.string().optional(),
      d: afz.string().optional()
    })
    const wrapper = await mountForm({ schema, cols: 2, expanded: false })
    const vm = wrapper.vm as unknown as { toggle: () => void }

    vm.toggle()
    await nextTick()

    expect(wrapper.emitted('update:expanded')).toEqual([[true]])
    expect(wrapper.emitted('expand')).toEqual([[true]])
  })
})
