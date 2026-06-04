<script setup lang="ts">
import type { PaginationState } from '@movk/nuxt'

// makePeople / usePeopleColumns / Showcase / ref 均由 movk unplugin 自动导入（共享自 playgrounds/play）
const columns = usePeopleColumns()
const data = makePeople(80)

const autoPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const sizePagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
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
</template>
