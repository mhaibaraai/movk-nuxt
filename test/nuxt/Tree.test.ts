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
  it('缺省按 value 取键，同名父节点的展开状态互不影响', async () => {
    const wrapper = await mountTree({
      items: [
        { label: 'dir', value: 'a', children: [{ label: 'a-child', value: 'a1' }] },
        { label: 'dir', value: 'b', children: [{ label: 'b-child', value: 'b1' }] }
      ],
      expanded: ['a']
    })
    await nextTick()

    const tree = wrapper.findComponent({ name: 'UTree' })
    expect((tree.props('getKey') as (item: object) => string)({ label: 'dir', value: 'b' })).toBe('b')
    expect(wrapper.text()).toContain('a-child')
    expect(wrapper.text()).not.toContain('b-child')
  })

  it.each([
    [true, ['a', 'b']],
    [undefined, ['b']]
  ])('valueKey 用于默认展开策略 %s 与节点标记', async (defaultExpanded, expected) => {
    const wrapper = await mountTree({
      items: [
        { id: 'a', label: 'dir', children: [{ id: 'a1', label: 'a-child' }] },
        { id: 'b', label: 'dir', defaultExpanded: true, children: [{ id: 'b1', label: 'b-child' }] }
      ],
      valueKey: 'id',
      defaultExpanded
    })

    expect(wrapper.emitted('update:expanded')?.at(-1)?.[0]).toEqual(expected)
    expect(wrapper.text()).toContain('b-child')
    expect(wrapper.text().includes('a-child')).toBe(defaultExpanded === true)
  })

  it('valueKey 隔离同名节点的选中状态、事件与 getNode 查询', async () => {
    const wrapper = await mountTree({
      items: [{ id: 'a', label: 'same' }, { id: 'b', label: 'same' }],
      valueKey: 'id',
      selectedKeys: ['a'],
      checkable: true,
      strategy: 'isolated'
    })
    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes.map(checkbox => checkbox.attributes('aria-checked'))).toEqual(['true', 'false'])

    await checkboxes[1]!.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['a', 'b'])
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toMatchObject({ keys: ['a', 'b'] })
    const vm = wrapper.vm as unknown as { getNode: (key: string) => unknown }
    expect(vm.getNode('a')).toMatchObject({ id: 'a' })
    expect(vm.getNode('b')).toMatchObject({ id: 'b' })
    expect(vm.getNode('same')).toBeUndefined()
  })

  it('同名懒加载节点按 valueKey 分别加载、重试并保留子树', async () => {
    let fail = true
    const loadChildren = vi.fn(async (node: { id: string }) => {
      if (node.id === 'b' && fail) throw new Error('retry b')
      return [{ id: `${node.id}1`, label: `${node.id}-child`, isLeaf: true }]
    })
    const createItems = () => [{ id: 'a', label: 'dir' }, { id: 'b', label: 'dir' }]
    const wrapper = await mountTree({
      items: createItems(),
      valueKey: 'id',
      defaultExpanded: true,
      lazy: true,
      loadChildren
    })
    await settle()
    await nextTick()

    expect(loadChildren.mock.calls.map(([node]) => node.id)).toEqual(['a', 'b'])
    expect(wrapper.text()).toContain('a-child')
    expect(wrapper.text()).not.toContain('b-child')
    expect(wrapper.emitted('loadError')?.[0]?.[0]).toMatchObject({ id: 'b' })

    fail = false
    await wrapper.findAll('button').find(button => button.text() === 'Retry')!.trigger('click')
    await settle()
    await nextTick()
    expect(loadChildren.mock.calls.map(([node]) => node.id)).toEqual(['a', 'b', 'b'])
    expect(wrapper.text()).toContain('a-child')
    expect(wrapper.text()).toContain('b-child')

    await wrapper.setProps({ items: createItems() } as never)
    await settle()
    expect(wrapper.text()).toContain('a-child')
    expect(wrapper.text()).toContain('b-child')
    expect(loadChildren).toHaveBeenCalledTimes(3)
  })

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
