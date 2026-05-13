<script setup lang="ts">
import { z } from 'zod'
import type { Person } from '../../composables/useMockData'

const { afz } = useAutoForm()

const schema = afz.object({
  keyword: afz.string({ controlProps: { placeholder: '姓名/邮箱/岗位' } }).meta({ label: '关键词' }).optional(),
  department: afz.enum(['研发', '设计', '产品', '运营', '市场']).meta({ label: '部门' }).optional(),
  level: afz.enum(['P5', 'P6', 'P7', 'P8']).meta({ label: '职级' }).optional(),
  status: afz.enum(['active', 'leave', 'offboarded']).meta({ label: '状态' }).optional(),
  joinedFrom: afz.calendarDate().meta({ label: '入职起' }).optional(),
  joinedTo: afz.calendarDate().meta({ label: '入职止' }).optional()
})
const state = reactive<Partial<z.input<typeof schema>>>({})

const cols = ref(3)
const visibleRows = ref(1)
const loading = ref(false)
const lastQuery = ref<Record<string, unknown>>({})

const tableColumns = usePeopleColumns()
const tableData = ref<Person[]>([])

async function onSearch(value: typeof state) {
  loading.value = true
  lastQuery.value = { ...value }
  const params = new URLSearchParams()
  if (value.keyword) params.set('keyword', value.keyword)
  const res = await $fetch<{ data: { items: Person[] } }>('/api/people', { query: { keyword: value.keyword || '' } })
  tableData.value = res.data.items
  loading.value = false
}

function onReset() {
  for (const k of Object.keys(state)) {
    (state as Record<string, unknown>)[k] = undefined
  }
  lastQuery.value = {}
  tableData.value = []
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="搜索表单 + DataTable 端到端"
      description="cols 网格 + visibleRows 折叠 + 搜索/重置事件"
    >
      <template #toolbar>
        <USelect v-model.number="cols" :items="[2, 3, 4, 6]" size="xs" class="w-20" />
        <USelect v-model.number="visibleRows" :items="[1, 2, 3]" size="xs" class="w-20" />
      </template>

      <MSearchForm
        :schema="schema"
        :state="state"
        :cols="cols"
        :visible-rows="visibleRows"
        :loading="loading"
        @search="onSearch"
        @reset="onReset"
      />
    </Showcase>

    <Showcase title="搜索结果" :state="lastQuery" aside-label="本次查询参数">
      <MDataTable
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        bordered
        empty-cell="—"
      />
    </Showcase>
  </div>
</template>
