# DataTable

Use `MDataTable` for data grids with configurable columns, table state, and row interactions. Use `MTree` when hierarchical items are the primary UI and column layout is unnecessary.

## Define columns and row identity

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { DataTableColumn } from '@movk/nuxt'

interface Person {
  id: string
  name: string
  email: string
}

const people: Person[] = [
  { id: 'ada', name: 'Ada', email: 'ada@example.com' }
]
const selected = ref<string[]>([])
const pagination = ref({ pageIndex: 0, pageSize: 10 })

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { accessorKey: 'name', header: 'Name', sortable: true },
  { accessorKey: 'email', header: 'Email', tooltip: true }
]
</script>

<template>
  <MDataTable
    v-model:row-selection-keys="selected"
    v-model:pagination="pagination"
    :columns="columns"
    :data="people"
    row-key="id"
  />
</template>
```

- Use a stable `row-key` for selection, expansion, pinning, and updates. If supplied, `getRowId` takes precedence.
- Use `children` on a column definition for grouped headers. Use `children-key` on the table to enable tree rows.
- Set `sortable`, `pinable`, and `resizable` globally or per column. An explicit column setting overrides the global setting. Set `fixed: 'left'` or `'right'` for initial column pinning.
- For a data column such as `name`, use `#name-header` to replace the label while keeping header controls, or `#name-cell` to take over cell rendering. In a cell slot, use `row.original` for source data.
- Use `stripe`, `bordered`, `density="compact"`, `sticky`, and `empty-cell` for appearance. Use `loading` and the `#empty` slot to present table state.

## Add interactions

Special column types are `selection`, `index`, `expand`, `row-pinning`, and `actions`. Use an expand column with `#expanded` for detail rows on a flat table. In a tree, use selection strategies `cascade`, `isolated`, or `leaf` and bind `expanded-keys` or `row-selection-keys` when the app needs the IDs. A numeric `indent-size` sets pixels per depth. The function form takes a cell context and returns a CSS string.

Use `actions` on the actions column. Each action's `onClick` receives a context whose `row` is the original record. The action can return a promise to show its pending state.

```ts
const actionColumn: DataTableColumn<Person> = {
  type: 'actions',
  actions: [{
    key: 'delete',
    buttonProps: { label: 'Delete', color: 'error' },
    confirm: true,
    confirmProps: { title: 'Delete this person?' },
    onClick: ({ row }) => deletePerson(row.id)
  }]
}
```

For row events, use `@select`, `@hover`, and `@row-contextmenu`. Derive handler types from `DataTableSelectHandler<T>`, `DataTableHoverHandler<T>`, and `DataTableContextmenuHandler<T>`. In `row-class` and `row-style` callbacks, the argument is the original record.

## Choose how rows are loaded

| Data source | Table setup |
| --- | --- |
| All rows already loaded | Bind `v-model:pagination` with `pageIndex` and `pageSize` for client-side paging. |
| Numbered pages from a server | Bind pagination, set `paginationOptions.manualPagination: true`, and provide `rowCount` or `pageCount`. Pass only the current page's rows. |
| Append pages on scroll | Pass a `:load-more` callback and `:can-load-more`. This mode hides the built-in pager. Return a promise to drive loading. Handle rejected loads via `@load-more-error`. |

`pageIndex` starts at zero. Convert it at the request boundary if the server uses one-based pages, and reset it when filters change. For server sorting, use manual sorting and fetch based on the bound sort state.

Enable `column-settings` to show column controls and set `persist-key` to save preferences in the browser. Use `exportCsv({ rows: 'page' })` or `exportCsv({ rows: 'selected' })` for loaded data. To export all matching server rows, provide `serverCsvExport` and merge the context's columns, sorting, and filters with the application's search criteria.

[Columns](https://nuxt.mhaibaraai.cn/docs/data-table/columns) · [Special columns](https://nuxt.mhaibaraai.cn/docs/data-table/special-columns) · [Pagination](https://nuxt.mhaibaraai.cn/docs/data-table/pagination)
