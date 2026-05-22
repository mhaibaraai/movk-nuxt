<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
const allKeys = ['id', 'name', 'department', 'role', 'level', 'email', 'joinedAt', 'salary']
const whitelistKeys = ref<string[]>([])
const excludeKeys = ref<string[]>([])

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'level', header: '职级', size: 100 },
  { accessorKey: 'email', header: '邮箱', size: 200 },
  { accessorKey: 'joinedAt', header: '入职日期', size: 130, visibility: false },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <USelect
        v-model="whitelistKeys"
        :items="allKeys"
        multiple
        size="xs"
        placeholder="白名单"
        class="w-56"
      />
      <USelect
        v-model="excludeKeys"
        :items="allKeys"
        multiple
        size="xs"
        placeholder="黑名单"
        class="w-56"
      />
    </div>
    <MDataTable
      :columns="columns"
      :data="data"
      bordered
      :column-visibility-keys="whitelistKeys.length ? whitelistKeys : undefined"
      :column-visibility-exclude-keys="excludeKeys.length ? excludeKeys : undefined"
    />
  </div>
</template>
