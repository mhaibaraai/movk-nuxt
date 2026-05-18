<script setup lang="ts">
import { CalendarDate } from '@movk/nuxt/composables'
import type { DateValue, DateRange } from '@movk/nuxt'

const formatter = useDateFormatter()

const basic = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))
const formFieldDate = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))
const fieldGroupDate = shallowRef<DateValue>(new CalendarDate(2025, 11, 18))

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
    <Showcase title="继承字段上下文" description="放入 UFormField 后继承 size 与错误态，日期触发按钮会按表单状态渲染。" :state="{ value: formFieldDate?.toString() }">
      <UFormField label="预约日期" size="xs" error="示例错误态">
        <MDatePicker v-model="formFieldDate" />
      </UFormField>
    </Showcase>

    <Showcase title="融入分组控件" description="日期触发按钮与操作按钮共享 UFieldGroup 尺寸，适合在筛选栏中组合快捷操作。" :state="{ value: fieldGroupDate?.toString() }">
      <UFieldGroup size="xs" class="w-full">
        <MDatePicker v-model="fieldGroupDate" />
        <UButton icon="i-lucide-calendar-check" color="neutral" variant="subtle" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="单日期选择" description="默认模式选择一个 CalendarDate，确认后将日期对象写入 v-model。" :state="{ value: basic?.toString() }">
      <MDatePicker v-model="basic" />
    </Showcase>

    <Showcase title="日期范围选择" description="range 模式维护 start/end 两端日期，并可通过 numberOfMonths 展示双月日历。" :state="{ start: range?.start?.toString(), end: range?.end?.toString() }">
      <MDatePicker v-model="range" range :number-of-months="2" />
    </Showcase>

    <Showcase title="多日期集合选择" description="multiple 模式将多个日期保存在数组中，按钮文案可根据已选数量动态展示。" :state="multi.map(d => d.toString())">
      <MDatePicker v-model="multi" multiple :button-props="{ label: `已选 ${multi.length} 天` }" />
    </Showcase>

    <Showcase title="限制可选日期边界" description="minValue 与 maxValue 会禁用边界外日期，分别约束只能选择未来或过去日期。" :state="{ future: futureDate?.toString(), past: pastDate?.toString() }">
      <div class="space-y-3">
        <UFormField label="未来日期">
          <MDatePicker v-model="futureDate" :min-value="formatter.getToday()" :button-props="{ label: '选择未来日期' }" />
        </UFormField>
        <UFormField label="过去日期">
          <MDatePicker v-model="pastDate" :max-value="formatter.getToday()" :button-props="{ label: '选择过去日期' }" />
        </UFormField>
      </div>
    </Showcase>

    <Showcase title="按规则禁用日期" description="isDateUnavailable 可按业务规则禁用日期，这里周末不可选且不会写入 v-model。" :state="{ value: weekday?.toString() }">
      <MDatePicker v-model="weekday" :is-date-unavailable="isDateUnavailable" :button-props="{ label: '仅工作日' }" />
    </Showcase>

    <Showcase title="自定义触发按钮文案" description="labelFormat 接收格式化工具和当前值，可把日期与星期信息组合为按钮 label。" :state="{ value: labeled?.toString() }">
      <MDatePicker
        v-model="labeled"
        :label-format="(f, v) => v ? `${f.format(v as DateValue)} (${f.getDayOfWeekName(v as DateValue, 'long')})` : '选择日期'"
      />
    </Showcase>

    <Showcase title="多月份日历面板" description="numberOfMonths 控制弹层内并排展示的月份数量，便于跨月选择。" :state="{ value: months?.toString() }">
      <MDatePicker v-model="months" :number-of-months="3" :button-props="{ label: '显示 3 个月' }" />
    </Showcase>

    <Showcase title="透传按钮属性" description="buttonProps 可覆盖触发按钮的 label、color、variant 与 icon，保持选择逻辑不变。" :state="{ value: buttonStyled?.toString() }">
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
      title="格式化 v-model 值"
      description="valueFormat 让 v-model 直接承载 ISO 字符串或 Unix 时间戳，组件内部负责 parse 与展示。"
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
      title="可清空选择"
      description="clearable 会在已有值时显示清除入口，点击后重置单选或范围值且不展开日历。"
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
      title="快捷日期预设"
      description="presets='default' 会按单选或范围模式生成快捷项，也可传入自定义数组返回业务日期。"
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
