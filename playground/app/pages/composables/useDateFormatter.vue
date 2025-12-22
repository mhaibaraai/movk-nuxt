<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { parseDate } from '@internationalized/date'

const formatter = useDateFormatter({
  locale: 'zh-CN',
  formatOptions: { dateStyle: 'long' }
})

const selectedDate = shallowRef<DateValue>(formatter.getToday())
const startDate = shallowRef<DateValue>(parseDate('2025-01-01'))
const endDate = shallowRef<DateValue>(parseDate('2025-12-31'))
const dates = shallowRef<DateValue[]>([
  parseDate('2025-01-15'),
  parseDate('2025-06-20'),
  parseDate('2025-12-25')
])

// 当前日期信息
const dateInfo = computed(() => {
  const date = selectedDate.value
  return {
    formatted: formatter.format(date),
    iso: formatter.toISO(date),
    timestamp: formatter.toTimestamp(date),
    unixTimestamp: formatter.toUnixTimestamp(date),
    dayOfWeek: formatter.getDayOfWeek(date),
    dayOfWeekName: formatter.getDayOfWeekName(date),
    dayOfWeekShort: formatter.getDayOfWeekName(date, 'short'),
    dayOfWeekNarrow: formatter.getDayOfWeekName(date, 'narrow'),
    isWeekend: formatter.isWeekend(date),
    isToday: formatter.isToday(date),
    weeksInMonth: formatter.getWeeksInMonth(date)
  }
})

// 日期范围
const rangeFormatted = computed(() =>
  formatter.formatRange(startDate.value, endDate.value)
)

// 日期数组
const arrayFormatted = computed(() =>
  formatter.formatArray(dates.value)
)

// 时间区间计算
const weekRange = computed(() => {
  const date = selectedDate.value
  return {
    start: formatter.format(formatter.getStartOfWeek(date)),
    end: formatter.format(formatter.getEndOfWeek(date))
  }
})

const monthRange = computed(() => {
  const date = selectedDate.value
  return {
    start: formatter.format(formatter.getStartOfMonth(date)),
    end: formatter.format(formatter.getEndOfMonth(date))
  }
})

const yearRange = computed(() => {
  const date = selectedDate.value
  return {
    start: formatter.format(formatter.getStartOfYear(date)),
    end: formatter.format(formatter.getEndOfYear(date))
  }
})
</script>

<template>
  <UContainer class="space-y-6 py-6 overflow-auto">
    <UPageCard title="选择日期">
      <MDatePicker v-model="selectedDate" />
    </UPageCard>

    <UPageCard title="日期信息">
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-gray-500">
            格式化输出
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.formatted }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            ISO 8601
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.iso }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            时间戳(毫秒)
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.timestamp }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            Unix 时间戳(秒)
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.unixTimestamp }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            星期几
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.dayOfWeekName }} ({{ dateInfo.dayOfWeek }})
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            星期（短）
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.dayOfWeekShort }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            星期（窄）
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.dayOfWeekNarrow }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            是否周末
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.isWeekend ? '是' : '否' }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            是否今天
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.isToday ? '是' : '否' }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">
            本月周数
          </dt>
          <dd class="font-mono text-sm">
            {{ dateInfo.weeksInMonth }}
          </dd>
        </div>
      </dl>
    </UPageCard>

    <UPageCard title="时间区间">
      <div class="space-y-4">
        <div>
          <dt class="text-sm text-gray-500 mb-1">
            本周
          </dt>
          <dd class="font-mono text-sm">
            {{ weekRange.start }} ~ {{ weekRange.end }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500 mb-1">
            本月
          </dt>
          <dd class="font-mono text-sm">
            {{ monthRange.start }} ~ {{ monthRange.end }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500 mb-1">
            本年
          </dt>
          <dd class="font-mono text-sm">
            {{ yearRange.start }} ~ {{ yearRange.end }}
          </dd>
        </div>
      </div>
    </UPageCard>

    <UPageCard title="日期范围格式化">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500 mb-1 block">开始日期</label>
            <MDatePicker v-model="startDate" />
          </div>
          <div>
            <label class="text-sm text-gray-500 mb-1 block">结束日期</label>
            <MDatePicker v-model="endDate" />
          </div>
        </div>
        <div>
          <dt class="text-sm text-gray-500 mb-1">
            格式化结果
          </dt>
          <dd class="font-mono text-sm">
            {{ rangeFormatted }}
          </dd>
        </div>
      </div>
    </UPageCard>

    <UPageCard title="日期数组格式化">
      <div>
        <dt class="text-sm text-gray-500 mb-2">
          格式化结果
        </dt>
        <dd class="font-mono text-sm">
          {{ arrayFormatted }}
        </dd>
      </div>
    </UPageCard>
  </UContainer>
</template>
