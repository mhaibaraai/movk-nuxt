<script setup lang="ts">
import type { DataTableColumn, RowSelectionState } from '#movk/types'
import type { Registration, RegistrationCopy, RegistrationDetails } from '../data/home-registration'
import { attendanceModes } from '../data/home-registration'

const props = defineProps<{ copy: RegistrationCopy, registrations: Registration[] }>()

const search = ref('')
const attendance = ref<'all' | RegistrationDetails['attendance']>('all')
const selection = ref<RowSelectionState>({})
const pagination = ref({ pageIndex: 0, pageSize: 4 })

const filters = computed(() => [
  { label: props.copy.allAttendance, value: 'all' },
  ...attendanceModes.map(value => ({ label: props.copy[value], value }))
])

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return props.registrations.filter(row =>
    (attendance.value === 'all' || row.attendance === attendance.value)
    && row.name.toLowerCase().includes(query)
  )
})

const selectedCount = computed(() => Object.values(selection.value).filter(Boolean).length)
const columns = computed<DataTableColumn<Registration>[]>(() => [
  { type: 'selection' },
  { type: 'expand' },
  { accessorKey: 'name', header: props.copy.name, sortable: true },
  { accessorKey: 'attendance', header: props.copy.attendance },
  { accessorKey: 'seats', header: props.copy.seats, align: 'right', sortable: true }
])
</script>

<template>
  <div class="space-y-4 p-4 sm:p-5">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold tracking-tight text-highlighted">
        {{ copy.registrations }}
      </h2>
      <span role="status" class="text-sm text-muted">{{ copy.selected.replace('{count}', String(selectedCount)) }}</span>
    </header>

    <div class="flex flex-wrap gap-2">
      <UInput
        v-model="search"
        :aria-label="copy.search"
        :placeholder="copy.search"
        icon="i-lucide-search"
        size="sm"
        class="min-w-40 flex-1"
      />
      <USelect v-model="attendance" :aria-label="copy.attendance" :items="filters" size="sm" class="min-w-28" />
    </div>

    <MDataTable
      v-model:row-selection="selection"
      v-model:pagination="pagination"
      row-key="id"
      :columns="columns"
      :data="filtered"
      :empty="copy.empty"
      :ui="{ th: 'px-2 py-2.5', td: 'px-2 py-2.5', root: 'rounded-md border border-default' }"
    >
      <template #attendance-cell="{ row }">
        <UBadge :label="copy[row.original.attendance]" :color="row.original.attendance === 'inPerson' ? 'primary' : 'info'" variant="subtle" size="sm" />
      </template>

      <template #expanded="{ row: { original } }">
        <dl class="grid gap-2 bg-muted/60 px-2 py-3 text-xs text-muted sm:grid-cols-2 sm:px-3">
          <div class="min-w-0">
            <dt class="font-medium text-highlighted">
              {{ copy.email }}
            </dt>
            <dd class="break-all">
              {{ original.email }}
            </dd>
          </div>
          <div>
            <dt class="font-medium text-highlighted">
              {{ copy.track }}
            </dt>
            <dd>{{ copy[original.track] }}</dd>
          </div>
          <div v-if="original.session">
            <dt class="font-medium text-highlighted">
              {{ copy.session }}
            </dt>
            <dd>{{ copy[original.session] }}</dd>
          </div>
          <div v-if="original.organization">
            <dt class="font-medium text-highlighted">
              {{ copy.organization }}
            </dt>
            <dd class="wrap-anywhere">
              {{ original.organization }}
            </dd>
          </div>
        </dl>
      </template>
    </MDataTable>
  </div>
</template>
