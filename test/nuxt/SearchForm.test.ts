import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import SearchForm from '../../src/runtime/components/SearchForm.vue'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'

const { afz } = useAutoForm()

const mounted: Array<{ unmount: () => void }> = []

async function mountForm(props: Record<string, unknown>, route?: string) {
  const wrapper = await mountSuspended(SearchForm, { props: props as never, attachTo: document.body, route })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('SearchForm', () => {
  it('响应式列数在水合后采用浏览器断点', async () => {
    const schema = afz.object({
      q1: afz.string().optional(),
      q2: afz.string().optional(),
      q3: afz.string().optional(),
      q4: afz.string().optional()
    })
    const createApp = () => createSSRApp({
      render: () => h(SearchForm, { schema, cols: { sm: 1, xl: 4 } })
    })
    const container = document.createElement('div')
    document.body.append(container)
    const matchMedia = window.matchMedia.bind(window)
    const viewport = vi.spyOn(window, 'matchMedia').mockImplementation(() => matchMedia('(min-width: 100000px)'))
    const app = createApp()
    const warn = vi.fn()
    app.config.warnHandler = warn

    try {
      container.innerHTML = await renderToString(createApp())
      expect(container.querySelector('[data-slot="visible"] input[name="q2"]')).toBeNull()

      viewport.mockImplementation(() => matchMedia('(min-width: 0px)'))
      app.mount(container)

      expect(warn.mock.calls.map(([message]) => message)).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Hydration')])
      )
      await nextTick()
      expect(container.querySelector('[data-slot="visible"] input[name="q2"]')).not.toBeNull()
    }
    finally {
      app.unmount()
      viewport.mockRestore()
    }
  })

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

  it('transformPayload 默认清洗提交数据', async () => {
    const onSubmit = vi.fn()
    const schema = afz.object({ keyword: afz.string().optional(), status: afz.string().optional() })
    const wrapper = await mountForm({ schema, modelValue: { keyword: '  a ', status: '' }, onSubmit })
    const vm = wrapper.vm as unknown as { submit: () => Promise<void> }

    await vm.submit()

    expect(onSubmit.mock.calls[0]?.[0].data).toEqual({ keyword: 'a' })
  })

  it.each([false, true])('syncQuery 为 %s 时可挂载响应式表单状态', async (syncQuery) => {
    const schema = afz.object({ keyword: afz.string().optional() })
    const model = reactive({ keyword: 'baseline' })
    const onError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await mountForm({ schema, modelValue: model, syncQuery }, '/?keyword=restored')

      expect(onError).not.toHaveBeenCalledWith('Error occurred while cloning:', expect.anything())
      expect(model.keyword).toBe(syncQuery ? 'restored' : 'baseline')
    }
    finally {
      onError.mockRestore()
    }
  })

  it('syncQuery 挂载时读取 URL query，提交时写回并保留其他 query', async () => {
    const schema = afz.object({ keyword: afz.string().optional(), page: afz.number().optional() })
    const model: Record<string, unknown> = {}
    const wrapper = await mountForm({ schema, modelValue: model, syncQuery: true, onSubmit: () => {} }, '/?keyword=abc&page=2&tab=x')
    await nextTick()

    expect(model).toEqual({ keyword: 'abc', page: 2 })

    const vm = wrapper.vm as unknown as { submit: () => Promise<void>, setFieldValue: (p: string, v: unknown) => void }
    vm.setFieldValue('keyword', 'next')
    await vm.submit()
    await vi.waitFor(() => expect(useRouter().currentRoute.value.query).toEqual({ tab: 'x', keyword: 'next', page: '2' }))
  })

  it('syncQuery 从路由恢复变更和移除的字段且保留其他状态', async () => {
    const schema = afz.object({ keyword: afz.string().optional(), status: afz.string().default('all') })
    const model = { keyword: 'baseline', extra: 1 }
    const onSubmit = vi.fn()
    const wrapper = await mountForm({ schema, modelValue: model, syncQuery: { replace: false }, onSubmit }, '/?keyword=first&status=open')
    const router = useRouter()
    const vm = wrapper.vm as unknown as { submit: () => Promise<void>, setFieldValue: (p: string, v: unknown) => void }
    expect(model.keyword).toBe('first')

    vm.setFieldValue('keyword', 'submitted')
    await vm.submit()
    await vi.waitFor(() => expect(router.currentRoute.value.query.keyword).toBe('submitted'))
    expect(wrapper.emitted('query-restore')).toHaveLength(1)

    router.back()
    await vi.waitFor(() => expect(model.keyword).toBe('first'))
    router.forward()
    await vi.waitFor(() => expect(model.keyword).toBe('submitted'))
    await router.push('/?tab=x')
    await vi.waitFor(() => expect(model).toEqual({ keyword: 'baseline', status: 'all', extra: 1 }))
    expect(wrapper.emitted('query-restore')?.at(-1)?.[0]).toEqual({ keyword: 'baseline', status: 'all' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
