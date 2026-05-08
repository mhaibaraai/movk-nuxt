<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'

const single = ref<DateValue>()
const range = ref<DateRange>()
const multi = ref<DateValue[]>([])
const formatted = ref<DateValue>()
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="单选" :state="{ value: single?.toString() }">
      <MDatePicker v-model="single" placeholder="选择日期" />
    </Showcase>

    <Showcase title="范围选择" :state="{ start: range?.start?.toString(), end: range?.end?.toString() }">
      <MDatePicker v-model="range" range placeholder="开始 - 结束" />
    </Showcase>

    <Showcase title="多选" :state="multi.map(d => d.toString())">
      <MDatePicker :model-value="(multi as never)" multiple placeholder="可多选" @update:model-value="(v: unknown) => multi = (v as DateValue[]) ?? []" />
    </Showcase>

    <Showcase
      title="labelFormat"
      description="自定义 label 渲染：函数接收 useDateFormatter 实例"
      :state="{ value: formatted?.toString() }"
    >
      <MDatePicker
        v-model="formatted"
        placeholder="选择日期"
        :label-format="(f, v) => v ? `${f.format(v as DateValue)} (${f.getDayOfWeekName(v as DateValue, 'long')})` : '选择日期'"
      />
    </Showcase>
  </div>
</template>
