# DataTable

Declarative data grid built on `@tanstack/vue-table` and Nuxt UI `UTable`. A single `columns` array drives data columns, special columns (selection / index / expand / row-pinning / actions), grouped headers, sorting, pinning, resizing, tree data, pagination, and load-more — fully typed.

## Basic table

```vue
<script setup lang="ts">
import type { DataTableDataColumn } from '@movk/nuxt'

interface User { id: string, name: string, email: string, role: 'admin' | 'editor' }

const data = ref<User[]>([
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'editor' }
])

const renderRole: DataTableDataColumn<User>['cell'] = ctx =>
  ctx.row.original.role === 'admin' ? 'Administrator' : 'Editor'

const columns: DataTableDataColumn<User>[] = [
  { accessorKey: 'name', header: 'Name', size: 'md' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role', align: 'right', cell: renderRole }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" row-key="id" />
</template>
```

## Key rules

- **Always set `row-key`** — selection, expansion, tree data and pinning all use it to identify rows.
- **Derive callback / event types from official exports** — `DataTableDataColumn<T>['cell' | 'truncate' | 'tooltip']`, `DataTableProps<T>['sortable' | 'pinable' | 'resizable']`, and `DataTableSelectHandler` / `HoverHandler` / `ContextmenuHandler` / `StateChangeHandler` for events.
- **Per-column prop > global prop** — use "global on + individual off" or vice versa to express exceptions, not row-by-row repetition.
- **Server-side pagination**: set `paginationOptions.manualPagination: true` + `rowCount`, and reset `pagination.pageIndex` to 0 whenever the search/filter changes.

## Sorting, pinning, resizing

Globally enable, override per-column. The same three accept `(col) => boolean` for dynamic decisions.

```vue
<script setup lang="ts">
import type { DataTableProps, DataTableDataColumn } from '@movk/nuxt'

const sortable: DataTableProps<User>['sortable'] = true
const pinable: DataTableProps<User>['pinable'] = col => col.id !== 'actions'

const columns: DataTableDataColumn<User>[] = [
  { accessorKey: 'name', header: 'Name', fixed: 'left' },
  { accessorKey: 'email', header: 'Email', sortable: false }, // override the global
  { accessorKey: 'role', header: 'Role', resizable: false }
]
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data"
    row-key="id"
    :sortable="sortable"
    :pinable="pinable"
    resizable
    column-resize-mode="onEnd"
  />
</template>
```

## Special columns

Set `type` to add a column without an `accessorKey`. Supported: `selection`, `index`, `expand`, `row-pinning`, `actions`.

```vue
<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'

const rowSelection = ref<Record<string, boolean>>({})

const columns: DataTableColumn<User>[] = [
  {
    type: 'selection',
    mode: 'multiple',
    strategy: 'cascade', // tree mode: cascade | isolated | leaf
    checkboxProps: ctx => ({
      disabled: ctx.scope === 'cell' && ctx.row?.original.role === 'admin'
    })
  },
  { type: 'index', header: '#' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    type: 'actions',
    header: 'Actions',
    items: ctx => [
      { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => edit(ctx.row.original) },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        confirm: { title: 'Delete user?', confirmLabel: 'Delete' },
        onSelect: () => remove(ctx.row.original)
      }
    ]
  }
]
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data"
    row-key="id"
    v-model:row-selection="rowSelection"
  />
</template>
```

Row pinning column:

```ts
{
  type: 'row-pinning',
  position: 'top', // or 'bottom'
  buttonProps: ({ pinned }) => pinned
    ? { icon: 'i-lucide-pin-off', color: 'primary' }
    : { icon: 'i-lucide-pin', color: 'neutral', variant: 'ghost' }
}
```

Expand column with a detail slot:

```vue
<template>
  <MDataTable :columns="columns" :data="data" row-key="id">
    <template #expanded="{ row }">
      <div class="p-4 bg-muted">{{ row.original.bio }}</div>
    </template>
  </MDataTable>
</template>
```

## Tree data

```vue
<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'

interface Dept { id: string, name: string, head?: string, children?: Dept[] }

const columns: DataTableColumn<Dept>[] = [
  { type: 'selection', mode: 'multiple', strategy: 'leaf' },
  { type: 'expand' },
  { accessorKey: 'name', header: 'Department' },
  { accessorKey: 'head', header: 'Head', emptyCell: '—' }
]

const selectionKeys = ref<string[]>([])
const tableRef = useTemplateRef<InstanceType<typeof MDataTable>>('table')

// expose API
function selectAll() {
  tableRef.value?.expandToDepth(2)
}
const leafSelected = computed(() => tableRef.value?.treeSelection.leaves ?? [])
</script>

<template>
  <MDataTable
    ref="table"
    :columns="columns"
    :data="data"
    row-key="id"
    children-key="children"
    :indent-size="depth => depth * 24"
    v-model:row-selection-keys="selectionKeys"
    v-model:expanded-keys="expandedKeys"
  />
</template>
```

Strategies: `cascade` (parent↔children linked), `isolated` (each row independent), `leaf` (only leaves selectable; parents show derived state). The exposed `treeSelection` gives `leaves`, `parents`, `halfSelected`, `strictlyChecked`.

## Pagination

### Client-side

```vue
<script setup lang="ts">
const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data"
    row-key="id"
    v-model:pagination="pagination"
  />
</template>
```

### Server-side

```vue
<script setup lang="ts">
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const search = ref('')

const { data, status } = await useAsyncData(
  'users',
  () => $api<{ items: User[], total: number }>('/users', {
    query: { page: pagination.value.pageIndex + 1, pageSize: pagination.value.pageSize, q: search.value }
  }),
  { watch: [pagination, search] }
)

watch(search, () => { pagination.value.pageIndex = 0 }) // reset to first page on new search
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data?.items ?? []"
    row-key="id"
    :loading="status === 'pending'"
    v-model:pagination="pagination"
    :pagination-options="{ manualPagination: true, rowCount: data?.total ?? 0 }"
    :pagination-ui="{
      pageSizes: [10, 20, 50],
      showSelectedCount: true,
      showRowRange: true
    }"
  />
</template>
```

Replace the whole pagination bar with `#pagination`, or just the summary / actions area with `#pagination-summary` / `#pagination-actions`.

## Row interactions

```vue
<script setup lang="ts">
import type {
  DataTableSelectHandler,
  HoverHandler,
  ContextmenuHandler
} from '@movk/nuxt'

const onSelect: DataTableSelectHandler<User> = (event, row) => {
  console.log('clicked', row.original.id)
}

const onHover: HoverHandler<User> = (event, row) => {
  hoveredId.value = row?.original.id ?? null
}

const onContextmenu: ContextmenuHandler<User> = (event, row) => {
  event.preventDefault()
  openMenu(event, row.original)
}
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data"
    row-key="id"
    select-on-row-click
    :row-class="row => row.original.role === 'admin' ? 'bg-primary/5' : ''"
    :row-style="row => row.original.banned ? { opacity: 0.5 } : {}"
    @select="onSelect"
    @hover="onHover"
    @row-contextmenu="onContextmenu"
  />
</template>
```

## Appearance & state

```vue
<MDataTable
  :columns="columns"
  :data="data"
  row-key="id"
  :loading="status === 'pending'"
  striped
  bordered
  dense
  sticky-header
  empty-cell="—"
/>
```

`empty-cell` sets the global placeholder; column-level `emptyCell` overrides it (set `false` to disable).

## Programmatic control

```vue
<script setup lang="ts">
const table = useTemplateRef<InstanceType<typeof MDataTable>>('table')

function clearAll() {
  table.value?.clearSelection()
  table.value?.collapseAll()
  table.value?.scrollToTop()
}

function expandFirstTwoLevels() {
  table.value?.expandToDepth(2)
}
</script>
```

Exposed: `clearSelection()`, `scrollToTop()`, `expandToDepth(depth)`, `collapseAll()`, `treeSelection`, plus `v-model:row-selection-keys` and `v-model:expanded-keys` for two-way state binding.
