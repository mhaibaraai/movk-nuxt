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
  [accessorKey: string]: unknown
}

export interface TableTreeNode {
  id: number
  name: string
  type: string
  size: number | null
  children?: TableTreeNode[]
  [accessorKey: string]: unknown
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

const treeData: TableTreeNode[] = [
  {
    id: 1,
    name: 'src',
    type: '目录',
    size: null,
    children: [
      {
        id: 2,
        name: 'components',
        type: '目录',
        size: null,
        children: [
          { id: 3, name: 'DataTable.vue', type: 'Vue 文件', size: 12800 },
          { id: 4, name: 'SearchForm.vue', type: 'Vue 文件', size: 8400 }
        ]
      },
      {
        id: 5,
        name: 'composables',
        type: '目录',
        size: null,
        children: [
          { id: 6, name: 'useDataTable.ts', type: 'TypeScript', size: 6200 }
        ]
      },
      { id: 7, name: 'style.css', type: 'CSS', size: 1200 }
    ]
  },
  {
    id: 8,
    name: 'docs',
    type: '目录',
    size: null,
    children: [
      { id: 9, name: 'README.md', type: 'Markdown', size: 3400 }
    ]
  }
]

const basicColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 100 },
  { accessorKey: 'email', header: '邮箱', tooltip: 2, maxSize: 100 },
  { accessorKey: 'department', header: '部门', minSize: 100 },
  { accessorKey: 'role', header: '职位', size: 140 }
]

const formattingColumns: DataTableColumn<TableUser>[] = [
  { accessorKey: 'name', header: '姓名', fixed: 'left' },
  { accessorKey: 'email', header: '邮箱' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    formatter: v => v != null ? `¥${(v as number).toLocaleString()}` : '',
    emptyText: '保密'
  },
  {
    accessorKey: 'status',
    header: '状态',
    formatter: v => statusMap[v as string] ?? String(v)
  },
  { accessorKey: 'bio', header: '简介', tooltip: 2, size: 100 }
]

const selectionColumns: DataTableColumn<TableUser>[] = [
  { type: 'selection', fixed: 'left' },
  { type: 'index', fixed: 'left' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位' },
  {
    accessorKey: 'status',
    header: '状态',
    formatter: v => statusMap[v as string] ?? String(v)
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
  { accessorKey: 'name', header: '姓名', sortable: true },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '职位' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    sortable: true,
    formatter: v => v != null ? `¥${(v as number).toLocaleString()}` : '',
    emptyText: '保密'
  },
  { accessorKey: 'joinDate', header: '入职日期', sortable: true },
  {
    accessorKey: 'status',
    header: '状态',
    visible: false,
    formatter: v => statusMap[v as string] ?? String(v)
  }
]

const pinningColumns: DataTableColumn<TableUser>[] = [
  { type: 'row-pinning', fixed: 'left', size: 44 },
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 120, sortable: true, pinable: true },
  { accessorKey: 'email', header: '邮箱', size: 240, pinable: true, tooltip: true },
  { accessorKey: 'department', header: '部门', size: 120, pinable: true },
  { accessorKey: 'role', header: '职位', size: 150, pinable: true },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    size: 140,
    sortable: true,
    pinable: true,
    formatter: v => v != null ? `¥${(v as number).toLocaleString()}` : '',
    emptyText: '保密'
  },
  { accessorKey: 'status', header: '状态', size: 110, pinable: true, formatter: v => statusMap[v as string] ?? String(v) }
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

const treeColumns: DataTableColumn<TableTreeNode>[] = [
  { type: 'expand', fixed: 'left', size: 40 },
  { accessorKey: 'name', header: '名称' },
  { accessorKey: 'type', header: '类型', size: 120 },
  {
    accessorKey: 'size',
    header: '大小',
    align: 'right',
    size: 100,
    formatter: v => v != null ? `${(v as number / 1024).toFixed(1)} KB` : '',
    emptyText: '—'
  }
]

export const useTableExamples = () => {
  return {
    users,
    largeUsers,
    treeData,
    basicColumns,
    formattingColumns,
    selectionColumns,
    actionsColumns,
    sortingColumns,
    pinningColumns,
    sizingColumns,
    treeColumns
  }
}
