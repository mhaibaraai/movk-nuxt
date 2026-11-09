<script setup lang="ts">
const f = useDateFormatter()
const today = f.getToday()
const nextWeek = today.add({ days: 7 })

const rows = [
  { call: 'format(today)', value: f.format(today) },
  { call: 'formatRange(today, nextWeek)', value: f.formatRange(today, nextWeek) },
  { call: 'toISO(today)', value: f.toISO(today) },
  { call: 'toTimestamp(today)', value: f.toTimestamp(today) },
  { call: 'toUnixTimestamp(today)', value: f.toUnixTimestamp(today) },
  { call: 'fromISO(\'2026-01-01\')', value: f.fromISO('2026-01-01')?.toString() },
  { call: 'getDayOfWeekName(today)', value: f.getDayOfWeekName(today) },
  { call: 'getEndOfMonth(today)', value: f.toISO(f.getEndOfMonth(today)) },
  { call: 'isWeekend(today)', value: f.isWeekend(today) },
  { call: 'convertToISO({ start, end })', value: JSON.stringify(f.convertToISO({ start: today, end: nextWeek })) }
]
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs text-muted">
      locale：{{ f.locale }} · timeZone：{{ f.timeZone }}
    </p>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-default text-left">
          <th class="py-1.5 pe-4 font-medium">
            调用
          </th>
          <th class="py-1.5 font-medium">
            返回值
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.call" class="border-b border-default last:border-0">
          <td class="py-1.5 pe-4 font-mono text-xs">
            {{ row.call }}
          </td>
          <td class="py-1.5 text-muted">
            {{ row.value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
