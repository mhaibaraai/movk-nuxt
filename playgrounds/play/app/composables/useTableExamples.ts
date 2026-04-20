import type { DataTableColumn } from '#movk/types/data-table'

export interface TableUser {
  id: number
  name: string
  email: string
  department: string
  role: string
  salary: number | null
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  bio: string
}

type Payment = {
  id: string
  date: string
  email: string
  amount: number
  children?: Payment[]
}

const statusMap: Record<string, string> = {
  active: '启用',
  inactive: '禁用',
  pending: '待审核'
}

const statuses: TableUser['status'][] = ['active', 'inactive', 'pending']

const users: TableUser[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', department: '研发部', role: '高级工程师', salary: 25000, joinDate: '2021-03-15', status: 'active', bio: '专注于前端架构设计，热爱开源社区，曾主导多个大型项目的技术选型与落地实施。' },
  { id: 2, name: '李四', email: 'lisi@example.com', department: '产品部', role: '产品经理', salary: 20000, joinDate: '2022-06-01', status: 'active', bio: '拥有丰富的 ToB 产品经验。' },
  { id: 3, name: '王五', email: 'wangwu@example.com', department: '设计部', role: 'UI 设计师', salary: null, joinDate: '2023-01-10', status: 'inactive', bio: '' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', department: '研发部', role: '后端工程师', salary: 22000, joinDate: '2020-11-20', status: 'pending', bio: '深耕 Java 生态，熟悉微服务架构与分布式系统设计，具备大规模系统调优经验。' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', department: '运营部', role: '运营专员', salary: 12000, joinDate: '2023-08-05', status: 'active', bio: '负责用户增长与活动运营。' }
]

const treeData: Payment[] = [
  {
    id: '4600',
    date: '2024-03-11T15:30:00',
    email: 'james.anderson@example.com',
    amount: 594,
    children: [
      {
        id: '4599',
        date: '2024-03-11T10:10:00',
        email: 'mia.white@example.com',
        amount: 276
      },
      {
        id: '4598',
        date: '2024-03-11T08:50:00',
        email: 'william.brown@example.com',
        amount: 315
      },
      {
        id: '4597',
        date: '2024-03-10T19:45:00',
        email: 'emma.davis@example.com',
        amount: 529,
        children: [
          {
            id: '4592',
            date: '2024-03-09T18:45:00',
            email: 'benjamin.jackson@example.com',
            amount: 851
          },
          {
            id: '4591',
            date: '2024-03-09T16:05:00',
            email: 'sophia.miller@example.com',
            amount: 762
          },
          {
            id: '4590',
            date: '2024-03-09T14:20:00',
            email: 'noah.clark@example.com',
            amount: 573,
            children: [
              {
                id: '4596',
                date: '2024-03-10T15:55:00',
                email: 'ethan.harris@example.com',
                amount: 639
              },
              {
                id: '4595',
                date: '2024-03-10T13:40:00',
                email: 'ava.thomas@example.com',
                amount: 428
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '4589',
    date: '2024-03-09T11:35:00',
    email: 'isabella.lee@example.com',
    amount: 389
  }
]

const basicColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 100 },
  { accessorKey: 'email', header: '邮箱', tooltip: 2, maxSize: 100, resizable: true },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位', _raw: { header: () => 'haha' } },
  { accessorKey: 'salary', header: '薪资', sortable: true },
  { accessorKey: 'joinDate', header: '入职日期' },
  { accessorKey: 'bio', header: '简介', size: 200, pinable: true, tooltip: 2 }
]

const groupingColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 100 },
  { accessorKey: 'email', header: '邮箱', tooltip: 2 },
  { accessorKey: 'salary', header: '薪资' },
  {
    header: '工作信息',
    fixed: 'left',
    children: [
      { accessorKey: 'department', header: '部门', size: 'md' },
      { accessorKey: 'role', header: '职位' }
    ]
  },
  { accessorKey: 'bio', header: '简介', size: 200, tooltip: 2 }
]

const formattingColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', fixed: 'left' },
  { accessorKey: 'email', header: '邮箱' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    cell: ({ row }) => `¥${row.getValue('salary')?.toLocaleString() ?? ''}`,
    emptyCell: '保密'
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ getValue }) => statusMap[getValue() as string] ?? String(getValue())
  },
  { accessorKey: 'bio', header: '简介', tooltip: 2, size: 100 }
]

const selectionColumns: DataTableColumn<TableUser>[] = [
  { type: 'selection', fixed: 'left', mode: 'single' },
  { type: 'index', fixed: 'left' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位' },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ getValue }) => statusMap[getValue() as string] ?? String(getValue())
  }
]

const actionsColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位' },
  {
    type: 'actions',
    fixed: 'right',
    actions: row => [
      {
        header: '编辑',
        icon: 'i-lucide-pencil',
        color: 'primary',
        onClick: () => alert(`编辑：${row.name}`)
      },
      {
        header: '禁用',
        icon: 'i-lucide-ban',
        color: 'error',
        hidden: row.status === 'inactive',
        onClick: () => alert(`禁用：${row.name}`)
      },
      {
        header: '删除',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onClick: () => alert(`删除：${row.name}`)
      }
    ]
  }
]

const sortingColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', sortable: true, sortButtonProps({ isSorted }) {
    const icon = isSorted === 'asc'
      ? 'i-lucide:bell-dot'
      : isSorted === 'desc'
        ? 'lucide:bell-off'
        : 'lucide:bell'
    return { icon }
  } },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    sortable: true,
    cell: ({ row }) => `¥${row.getValue('salary')?.toLocaleString() ?? ''}`,
    emptyCell: '保密'
  },
  { accessorKey: 'joinDate', header: '入职日期', sortable: true },
  {
    accessorKey: 'status',
    header: '状态',
    visibility: false,
    cell: ({ getValue }) => statusMap[getValue() as string] ?? String(getValue())
  }
]

const pinningColumns: DataTableColumn<TableUser>[] = [
  { type: 'index', fixed: 'left', resizable: true, enableResizing: true, align: 'left' },
  { type: 'row-pinning', fixed: 'right', position: 'bottom', visibility: true, resizable: true },
  { accessorKey: 'name', header: '姓名', fixed: 'left', resizable: true, pinable: true, pinButtonProps: { icon: 'i-lucide-star' } },
  { accessorKey: 'email', header: '邮箱', size: 240 },
  { accessorKey: 'department', header: '部门', visibility: false },
  { accessorKey: 'role', header: '职位' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    cell: ({ row }) => `¥${row.getValue('salary')?.toLocaleString() ?? ''}`,
    emptyCell: '保密'
  },
  { accessorKey: 'status', header: '状态', cell: ({ getValue }) => statusMap[getValue() as string] ?? String(getValue()) }
]

const sizingColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', size: 140, minSize: 100, maxSize: 260, resizable: true },
  { accessorKey: 'email', header: '邮箱', size: 280, minSize: 180, maxSize: 460, resizable: true, tooltip: true },
  { accessorKey: 'department', header: '部门', size: 140, minSize: 100, maxSize: 240, resizable: true },
  { accessorKey: 'role', header: '职位', size: 180, minSize: 120, maxSize: 320, resizable: true },
  {
    accessorKey: 'bio',
    header: '简介',
    size: 360,
    minSize: 180,
    maxSize: 640,
    resizable: true,
    tooltip: 2
  }
]

const largeUsers: TableUser[] = Array.from({ length: 80 }, (_, index) => {
  const source = users[index % users.length]!
  const sequence = index + 1

  return {
    ...source,
    id: 10_000 + sequence,
    name: `${source.name}${sequence}`,
    email: `demo-${sequence}@example.com`,
    salary: source.salary == null ? null : source.salary + (sequence % 5) * 500,
    status: statuses[sequence % statuses.length]!
  }
})

const treeColumns: DataTableColumn<Payment>[] = [
  { type: 'selection', mode: 'multiple', size: 40 },
  { type: 'expand' },
  { accessorKey: 'date', header: '日期', cell: ({ row }) => {
    return new Date(row.getValue('date')).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } },
  { accessorKey: 'email', header: '邮箱' },
  {
    accessorKey: 'amount',
    header: '金额',
    align: 'right',
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'))
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }
  }
]

export const useTableExamples = () => {
  return {
    users,
    largeUsers,
    treeData,
    basicColumns,
    groupingColumns,
    formattingColumns,
    selectionColumns,
    actionsColumns,
    sortingColumns,
    pinningColumns,
    sizingColumns,
    treeColumns
  }
}
