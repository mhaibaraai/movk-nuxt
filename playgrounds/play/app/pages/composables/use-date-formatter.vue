<script setup lang="ts">
const f = useDateFormatter({ locale: 'zh-CN' })
const today = f.getToday()
const range = { start: today, end: today.add({ days: 7 }) }
const list = [today, today.add({ days: 1 }), today.add({ days: 2 })]

const rows = [
  { method: 'format(today)', value: f.format(today) },
  { method: 'toISO(today)', value: f.toISO(today) },
  { method: 'toTimestamp(today)', value: f.toTimestamp(today) },
  { method: 'toUnixTimestamp(today)', value: f.toUnixTimestamp(today) },
  { method: 'isWeekend(today)', value: f.isWeekend(today) },
  { method: 'isWeekday(today)', value: f.isWeekday(today) },
  { method: 'isToday(today)', value: f.isToday(today) },
  { method: 'getDayOfWeek(today)', value: f.getDayOfWeek(today) },
  { method: `getDayOfWeekName(today, 'long')`, value: f.getDayOfWeekName(today, 'long') },
  { method: `getDayOfWeekName(today, 'short')`, value: f.getDayOfWeekName(today, 'short') },
  { method: 'getStartOfMonth(today)', value: f.toISO(f.getStartOfMonth(today)) },
  { method: 'getEndOfMonth(today)', value: f.toISO(f.getEndOfMonth(today)) },
  { method: 'getStartOfYear(today)', value: f.toISO(f.getStartOfYear(today)) },
  { method: 'getEndOfYear(today)', value: f.toISO(f.getEndOfYear(today)) },
  { method: 'formatRange(start, end)', value: f.formatRange(range.start, range.end) },
  { method: 'formatArray([d, d+1, d+2])', value: f.formatArray(list) },
  { method: 'parse("2026-01-01")?.toString()', value: f.parse('2026-01-01')?.toString() ?? 'null' }
]

const columns = [
  { accessorKey: 'method', header: '调用' },
  { accessorKey: 'value', header: '返回值' }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="useDateFormatter 方法表"
      :description="`locale=${f.locale} · timeZone=${f.timeZone}`"
    >
      <MDataTable :columns="columns" :data="rows" stripe bordered density="compact" />
    </Showcase>
  </div>
</template>
