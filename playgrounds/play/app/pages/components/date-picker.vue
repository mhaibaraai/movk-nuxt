<script setup lang="ts">
import { CalendarDate } from '@movk/nuxt/composables'
import type { DateValue, DateRange } from '@movk/nuxt'

const formatter = useDateFormatter()

const basic = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))

const range = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 30)
})

const multi = shallowRef<DateValue[]>([
  new CalendarDate(2025, 11, 1),
  new CalendarDate(2025, 11, 15),
  new CalendarDate(2025, 11, 30)
])

const futureDate = shallowRef<DateValue>()
const pastDate = shallowRef<DateValue>()

const weekday = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))
const isDateUnavailable = (date: DateValue) => formatter.isWeekend(date)

const labeled = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))

const months = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))

const buttonStyled = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))

const isoValue = shallowRef<string>('2025-11-06')
const unixRange = shallowRef<{ start: number | undefined, end: number | undefined }>({
  start: undefined,
  end: undefined
})

const clearableSingle = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))
const clearableRange = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 15)
})

const presetDefault = shallowRef<DateRange>()
const presetCustom = shallowRef<DateValue>()
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="基础用法" :state="{ value: basic?.toString() }">
      <MDatePicker v-model="basic" />
    </Showcase>

    <Showcase title="日期范围" :state="{ start: range?.start?.toString(), end: range?.end?.toString() }">
      <MDatePicker v-model="range" range :number-of-months="2" />
    </Showcase>

    <Showcase title="多日期选择" :state="multi.map(d => d.toString())">
      <MDatePicker v-model="multi" multiple :button-props="{ label: `已选 ${multi.length} 天` }" />
    </Showcase>

    <Showcase title="日期限制（min/max）" :state="{ future: futureDate?.toString(), past: pastDate?.toString() }">
      <div class="space-y-3">
        <UFormField label="未来日期">
          <MDatePicker v-model="futureDate" :min-value="formatter.getToday()" :button-props="{ label: '选择未来日期' }" />
        </UFormField>
        <UFormField label="过去日期">
          <MDatePicker v-model="pastDate" :max-value="formatter.getToday()" :button-props="{ label: '选择过去日期' }" />
        </UFormField>
      </div>
    </Showcase>

    <Showcase title="禁用特定日期" description="使用 isDateUnavailable 禁用周末" :state="{ value: weekday?.toString() }">
      <MDatePicker v-model="weekday" :is-date-unavailable="isDateUnavailable" :button-props="{ label: '仅工作日' }" />
    </Showcase>

    <Showcase title="labelFormat" description="自定义按钮 label 渲染" :state="{ value: labeled?.toString() }">
      <MDatePicker
        v-model="labeled"
        :label-format="(f, v) => v ? `${f.format(v as DateValue)} (${f.getDayOfWeekName(v as DateValue, 'long')})` : '选择日期'"
      />
    </Showcase>

    <Showcase title="多月份显示" :state="{ value: months?.toString() }">
      <MDatePicker v-model="months" :number-of-months="3" :button-props="{ label: '显示 3 个月' }" />
    </Showcase>

    <Showcase title="自定义按钮" :state="{ value: buttonStyled?.toString() }">
      <MDatePicker
        v-model="buttonStyled"
        :button-props="{
          label: '选择生日',
          color: 'primary',
          variant: 'outline',
          icon: 'i-lucide-cake'
        }"
      />
    </Showcase>

    <Showcase
      title="valueFormat"
      description="v-model 直接承载格式化值；外部传 ISO 字符串/unix 时间戳，组件内部反向 parse"
      :state="{ iso: isoValue, unixRange }"
    >
      <div class="space-y-3">
        <UFormField label="ISO 字符串">
          <MDatePicker v-model="isoValue" value-format="iso" />
        </UFormField>
        <UFormField label="Unix 时间戳（范围）">
          <MDatePicker v-model="unixRange" range value-format="unix" />
        </UFormField>
      </div>
    </Showcase>

    <Showcase
      title="clearable"
      description="选中后右侧出现 X，点击清空且不展开"
      :state="{ single: clearableSingle?.toString(), range: { start: clearableRange?.start?.toString(), end: clearableRange?.end?.toString() } }"
    >
      <div class="space-y-3">
        <MDatePicker
          v-model="clearableSingle"
          clearable
          :button-props="{
            ui: {
              label: 'flex-1'
            }
          }"
        />
        <MDatePicker v-model="clearableRange" clearable range :button-props="{ ui: { label: 'flex-1' } }" />
      </div>
    </Showcase>

    <Showcase
      title="presets"
      description="快捷预设：default 自动按 range/single 选集，也可传自定义数组"
      :state="{ defaultRange: { start: presetDefault?.start?.toString(), end: presetDefault?.end?.toString() }, custom: presetCustom?.toString() }"
    >
      <div class="space-y-3">
        <UFormField label="默认预设（范围）">
          <MDatePicker v-model="presetDefault" range presets="default" placeholder="选择范围" />
        </UFormField>
        <UFormField label="自定义预设（单选）">
          <MDatePicker
            v-model="presetCustom"
            placeholder="选择日期"
            :presets="[
              { label: '本周一', value: f => f.getStartOfWeek(f.getToday()) as DateValue },
              { label: '本月初', value: f => f.getStartOfMonth(f.getToday()) as DateValue },
              { label: '本年初', value: f => f.getStartOfYear(f.getToday()) as DateValue }
            ]"
          />
        </UFormField>
      </div>
    </Showcase>
  </div>
</template>
