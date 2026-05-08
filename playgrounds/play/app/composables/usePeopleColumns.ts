import type { DataTableColumn } from '#movk/types/data-table/columns'
import type { Person } from './useMockData'

const STATUS_LABEL: Record<Person['status'], string> = {
  active: '在职',
  leave: '休假',
  offboarded: '已离职'
}

const STATUS_COLOR: Record<Person['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  leave: 'warning',
  offboarded: 'neutral'
}

export function usePeopleColumns(): DataTableColumn<Person>[] {
  return [
    { accessorKey: 'id', header: '工号', size: 100 },
    { accessorKey: 'name', header: '姓名', size: 120 },
    { accessorKey: 'email', header: '邮箱', size: 220 },
    { accessorKey: 'department', header: '部门', size: 100 },
    { accessorKey: 'role', header: '岗位', size: 160 },
    { accessorKey: 'level', header: '职级', size: 80 },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ getValue }) => {
        const v = getValue<Person['status']>()
        return h(resolveComponent('UBadge'), { color: STATUS_COLOR[v], variant: 'subtle' }, () => STATUS_LABEL[v])
      }
    },
    {
      accessorKey: 'salary',
      header: '薪资',
      size: 120,
      align: 'right',
      cell: ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
    },
    { accessorKey: 'joinedAt', header: '入职日期', size: 120 }
  ]
}
