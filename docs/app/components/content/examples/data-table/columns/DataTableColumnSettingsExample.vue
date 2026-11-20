<script setup lang="ts">
const data = [{ name: 'Ada', team: 'Research' }, { name: 'Lin', team: 'Design' }]
const columns = [{ accessorKey: 'name', header: 'Name' }, { accessorKey: 'team', header: 'Team' }]
const table = useTemplateRef('table')
</script>

<template>
  <MDataTable ref="table" :data="data" :columns="columns" column-settings persist-key="docs-people-columns">
    <template #toolbar>
      <UButton label="Export displayed columns" @click="table?.exportCsv({ rows: 'page', filename: 'people.csv' })" />
      <UButton label="Reset columns" variant="outline" @click="table?.resetColumns()" />
    </template>
  </MDataTable>
</template>
