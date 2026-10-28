import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Tree from '../../src/runtime/components/Tree.vue'

const items = [
  { label: 'fruit', children: [{ label: 'apple' }, { label: 'pear' }] },
  { label: 'veg', children: [{ label: 'carrot' }] }
]

const mounted: Array<{ unmount: () => void }> = []

async function mountTree(props: Record<string, unknown>) {
  const wrapper = await mountSuspended(Tree, { props: props as never })
  mounted.push(wrapper)
  return wrapper
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('Tree', () => {
  it('懒加载失败时显示重试，重试成功后渲染子节点并 emit loadError', async () => {
    let fail = true
    const loadChildren = vi.fn(async () => {
      if (fail) throw new Error('boom')
      return [{ label: 'child', isLeaf: true }]
    })
    const wrapper = await mountTree({ items: [{ label: 'root' }], lazy: true, loadChildren })

    wrapper.findComponent({ name: 'UTree' }).vm.$emit('update:expanded', ['root'])
    await settle()
    await nextTick()

    expect(wrapper.emitted('loadError')?.[0]?.[1]).toBeInstanceOf(Error)
    const retry = wrapper.findAll('button').find(b => b.text() === 'Retry')!
    fail = false
    await retry.trigger('click')
    await settle()
    await nextTick()

    expect(wrapper.text()).toContain('child')
  })

  it('items 引用变化后保留已加载的子树', async () => {
    const loadChildren = async () => [{ label: 'child', isLeaf: true }]
    const wrapper = await mountTree({ items: [{ label: 'root' }], lazy: true, loadChildren, expanded: ['root'] })
    await settle()
    expect(wrapper.text()).toContain('child')

    await wrapper.setProps({ items: [{ label: 'root' }] } as never)
    await nextTick()

    expect(wrapper.text()).toContain('child')
  })

  it('搜索不命中懒加载占位，结束搜索后恢复展开状态', async () => {
    const wrapper = await mountTree({
      items: [{ label: 'fruit', children: [{ label: 'apple' }] }, { label: 'lazy-node' }],
      lazy: true,
      loadChildren: async () => [],
      searchable: true,
      expanded: []
    })

    await wrapper.setProps({ search: 'movk' } as never)
    await nextTick()
    expect(wrapper.text()).toContain('No results')

    await wrapper.setProps({ search: 'apple' } as never)
    await nextTick()
    expect(wrapper.emitted('update:expanded')?.at(-1)?.[0]).toEqual(['fruit'])

    await wrapper.setProps({ search: '' } as never)
    await nextTick()
    expect(wrapper.emitted('update:expanded')?.at(-1)?.[0]).toEqual([])
  })

  it('leaf 策略的 change 以叶子分类', async () => {
    const wrapper = await mountTree({ items, checkable: true, strategy: 'leaf' })
    const vm = wrapper.vm as unknown as { selectAll: () => void, getNode: (k: string) => unknown }

    vm.selectAll()
    await nextTick()

    const payload = wrapper.emitted('change')?.[0]?.[0] as { selection: { leaves: Array<{ label: string }> } }
    expect(payload.selection.leaves.map(n => n.label)).toEqual(['apple', 'pear', 'carrot'])
    expect(vm.getNode('pear')).toMatchObject({ label: 'pear' })
  })

  it('searchMethod 远程搜索替代本地过滤', async () => {
    const searchMethod = vi.fn(async () => [{ label: 'remote' }])
    const wrapper = await mountTree({ items, searchable: true, searchMethod, searchDebounce: 0 })

    await wrapper.setProps({ search: 'x' } as never)
    await settle()
    await nextTick()

    expect(searchMethod).toHaveBeenCalledWith('x')
    expect(wrapper.text()).toContain('remote')
    expect(wrapper.text()).not.toContain('fruit')
  })
})
