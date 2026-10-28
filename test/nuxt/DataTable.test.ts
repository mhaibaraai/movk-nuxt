import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DataTable from '../../src/runtime/components/DataTable.vue'

interface Row {
  id: number
  name: string
  age?: number
  children?: Row[]
}

const data: Row[] = [
  { id: 1, name: 'a', children: [{ id: 11, name: 'a1' }] },
  { id: 2, name: 'b' }
]

const mounted: Array<{ unmount: () => void }> = []

async function mountTable(props: Record<string, unknown>) {
  const wrapper = await mountSuspended(DataTable, { props: { data, ...props } as never })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('DataTable', () => {
  it('分页摘要的已选数只统计为 true 的行', async () => {
    const wrapper = await mountTable({
      columns: [{ type: 'selection' }, { accessorKey: 'name' }],
      rowKey: 'id',
      rowSelection: { 1: true, 2: false },
      paginationUi: { show: true }
    })
    await nextTick()
    expect(wrapper.text()).toContain('1 selected')
  })

  it('新增列遵守 columnVisibilityKeys 白名单', async () => {
    const wrapper = await mountTable({
      columns: [{ accessorKey: 'name' }],
      columnVisibilityKeys: ['name']
    })
    await wrapper.setProps({ columns: [{ accessorKey: 'name' }, { accessorKey: 'age' }] } as never)
    await nextTick()

    const headers = wrapper.findAll('th').map(th => th.text())
    expect(headers).toEqual(['name'])
  })

  it('未设 rowKey 时 treeSelection 按 TanStack 行 id 解析', async () => {
    const wrapper = await mountTable({
      columns: [{ type: 'selection' }, { accessorKey: 'name' }],
      childrenKey: 'children',
      rowSelectionKeys: ['0', '0.0']
    })
    await nextTick()
    const vm = wrapper.vm as unknown as { treeSelection: { selected: Row[] } }
    expect(vm.treeSelection.selected.map(row => row.name).sort()).toEqual(['a', 'a1'])
  })

  it('getSelectedRows / selectAll / expandAll', async () => {
    const wrapper = await mountTable({
      columns: [{ type: 'selection' }, { type: 'expand' }, { accessorKey: 'name' }],
      rowKey: 'id',
      childrenKey: 'children'
    })
    const vm = wrapper.vm as unknown as { selectAll: () => void, expandAll: () => void, getSelectedRows: () => Row[] }

    vm.selectAll()
    await nextTick()
    expect(vm.getSelectedRows().map(row => row.id).sort()).toEqual([1, 11, 2])

    vm.expandAll()
    await nextTick()
    expect(wrapper.text()).toContain('a1')
  })

  it('persistKey 挂载后恢复列状态并随变化写回', async () => {
    localStorage.setItem('movk-data-table:users', JSON.stringify({ columnVisibility: { age: false } }))
    const wrapper = await mountTable({
      columns: [{ accessorKey: 'name' }, { accessorKey: 'age' }],
      persistKey: 'users'
    })
    await nextTick()
    expect(wrapper.findAll('th').map(th => th.text())).toEqual(['name'])

    const vm = wrapper.vm as unknown as { resetColumns: () => void }
    vm.resetColumns()
    await nextTick()
    expect(wrapper.findAll('th').map(th => th.text())).toEqual(['name', 'age'])
    expect(localStorage.getItem('movk-data-table:users')).not.toContain('"age":false')
    localStorage.removeItem('movk-data-table:users')
  })

  it('columnSettings 渲染工具栏按钮', async () => {
    const wrapper = await mountTable({ columns: [{ accessorKey: 'name' }], columnSettings: true })
    expect(wrapper.find('[data-slot="toolbar"] button[aria-label="Columns"]').exists()).toBe(true)
  })

  it('加载中且无数据时渲染骨架行', async () => {
    const wrapper = await mountTable({ data: [], columns: [{ accessorKey: 'name' }], loading: true, skeletonRows: 3 })
    expect(wrapper.findAll('[data-slot="skeleton"] > *')).toHaveLength(3)
  })
})
