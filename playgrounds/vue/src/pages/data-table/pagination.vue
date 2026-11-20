<script setup lang="ts">
import type { DataTableServerCsvContext, PaginationState } from '@movk/nuxt'

// makePeople / usePeopleColumns / Showcase / ref 均由 movk unplugin 自动导入（共享自 playgrounds/play）
const columns = usePeopleColumns()
const data = makePeople(80)

const autoPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const sizePagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
const table = useTemplateRef('table')

function simulateServerExport({ columns, filename }: DataTableServerCsvContext) {
  const fields = columns.filter((column): column is keyof typeof data[number] => Object.hasOwn(data[0] ?? {}, column))
  const lines = data.map(person => fields.map(field => `"${String(person[field]).replaceAll('"', '""')}"`).join(','))
  const csv = [fields.join(','), ...lines].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? 'people.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Showcase
    title="客户端自动分页"
    description="传入 v-model:pagination 即触发自动分页，组件在本地切片数据并渲染默认分页栏（Vue + Vite 模式下的纯前端分页，无需服务端）。"
    :state="{ pageIndex: autoPagination.pageIndex, pageSize: autoPagination.pageSize }"
  >
    <MDataTable
      v-model:pagination="autoPagination"
      :data="data"
      :columns="columns"
    />
  </Showcase>

  <Showcase
    title="每页条数"
    description="调整 pageSize 即按新分页大小本地切片。"
    :state="{ pageIndex: sizePagination.pageIndex, pageSize: sizePagination.pageSize }"
  >
    <MDataTable
      v-model:pagination="sizePagination"
      :data="data"
      :columns="columns"
    />
  </Showcase>
  <Showcase title="全量 CSV 导出" description="通过 serverCsvExport 模拟独立的下载函数，导出全部数据。">
    <UButton label="下载全部数据" @click="table?.exportServerCsv({ filename: 'people.csv' })" />
    <MDataTable
      ref="table"
      v-model:pagination="sizePagination"
      :data="data"
      :columns="columns"
      :server-csv-export="simulateServerExport"
    />
  </Showcase>
</template>
