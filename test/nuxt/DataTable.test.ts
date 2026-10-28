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
})
