<script setup lang="ts">
import { UPopover, UButton, UCalendar } from '#components'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, PopoverProps, PopoverSlots } from '@nuxt/ui'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { computed } from 'vue'

interface DateRange {
  start: DateValue | undefined
  end: DateValue | undefined
}

interface DateRangePickerProps extends /** @vue-ignore */ PopoverProps {
  /**
   * 按钮的属性配置
   */
  buttonProps?: ButtonProps
  /**
   * 日历的属性配置
   */
  calendarProps?: Record<string, any>
  /**
   * 日期格式化选项
   */
  dateFormatOptions?: Intl.DateTimeFormatOptions
  /**
   * 日期格式化的语言区域
   */
  locale?: string
  /**
   * 占位符文本
   */
  placeholder?: string
  /**
   * 显示的月份数量
   */
  numberOfMonths?: number
}

type DateRangePickerSlots = OmitByKey<PopoverSlots, 'content' | 'default'>

const {
  buttonProps,
  calendarProps,
  dateFormatOptions = { dateStyle: 'medium' },
  locale = 'zh-CN',
  placeholder = 'Pick a date',
  numberOfMonths = 2
} = defineProps<DateRangePickerProps>()

const slots = defineSlots<DateRangePickerSlots>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<DateRange>()

const df = computed(() => new DateFormatter(locale, dateFormatOptions))

const formattedDate = computed(() => {
  if (!modelValue.value?.start)
    return placeholder

  const startDate = df.value.format(modelValue.value.start.toDate(getLocalTimeZone()))

  if (!modelValue.value.end)
    return startDate

  const endDate = df.value.format(modelValue.value.end.toDate(getLocalTimeZone()))
  return `${startDate} - ${endDate}`
})
</script>

<template>
  <UPopover v-bind="$attrs">
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template #default>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-calendar"
        v-bind="buttonProps"
      >
        {{ formattedDate }}
      </UButton>
    </template>

    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
        :number-of-months="numberOfMonths"
        range
        v-bind="calendarProps"
      />
    </template>
  </UPopover>
</template>
