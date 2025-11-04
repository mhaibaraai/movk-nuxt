<script setup lang="ts" generic="R extends boolean, M extends boolean, P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UCalendar } from '#components'
import type { ButtonProps, PopoverProps, CalendarProps, PopoverEmits, CalendarEmits } from '@nuxt/ui'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { computed } from 'vue'
import type { OmitByKey } from '@movk/core'

interface DatePickerProps extends /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue'> {
  buttonProps?: ButtonProps
  popoverProps?: PopoverProps<P>
  /**
   * 日期格式化选项
   * @see https://react-spectrum.adobe.com/internationalized/date/index.html
   */
  dateFormatOptions?: Intl.DateTimeFormatOptions
  /**
   * 日期格式化的语言区域
   */
  locale?: string
  /**
   * 按钮标签
   * 可以是字符串或函数 (df, modelValue) => string
   */
  label?: string | ((df: DateFormatter, modelValue: CalendarProps<R, M>['modelValue']) => string)
  placeholderLabel?: string
}

type DatePickerEmits = PopoverEmits & CalendarEmits<R, M>

const {
  buttonProps,
  popoverProps,
  dateFormatOptions = { dateStyle: 'medium' } as Intl.DateTimeFormatOptions,
  locale = 'zh-CN',
  label,
  placeholderLabel = '选择日期'
} = defineProps<DatePickerProps>()

const emit = defineEmits<DatePickerEmits>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<CalendarProps<R, M>['modelValue']>()

const df = new DateFormatter(locale, dateFormatOptions)

const formattedDate = computed(() => {
  if (typeof label === 'function') {
    return label(df, modelValue.value)
  }

  if (typeof label === 'string') {
    return label
  }

  if (!modelValue.value) {
    return placeholderLabel
  }

  if (Array.isArray(modelValue.value)) {
    if (modelValue.value.length === 0) {
      return placeholderLabel
    }
    return modelValue.value
      .map(date => df.format(date.toDate(getLocalTimeZone())))
      .join(', ')
  }

  if (typeof modelValue.value === 'object' && 'start' in modelValue.value && 'end' in modelValue.value) {
    const range = modelValue.value as { start: DateValue | undefined, end: DateValue | undefined }
    if (!range.start || !range.end) {
      return placeholderLabel
    }
    return `${df.format(range.start.toDate(getLocalTimeZone()))} - ${df.format(range.end.toDate(getLocalTimeZone()))}`
  }

  const singleDate = modelValue.value as DateValue
  return df.format(singleDate.toDate(getLocalTimeZone()))
})
</script>

<template>
  <UPopover v-bind="popoverProps" @close:prevent="emit('close:prevent')" @update:open="emit('update:open', $event)">
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          :label="formattedDate"
          color="neutral"
          variant="subtle"
          icon="i-lucide-calendar"
          class="w-full"
          v-bind="buttonProps"
        />
      </slot>
    </template>

    <template v-if="$slots.anchor" #anchor="anchor">
      <slot name="anchor" v-bind="anchor" />
    </template>

    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
        v-bind="$attrs"
        @update:placeholder="(e: any) => emit('update:placeholder', e)"
        @update:start-value="emit('update:startValue', $event)"
        @update:valid-model-value="emit('update:validModelValue', $event)"
      >
        <template v-if="$slots.day" #day="day">
          <slot name="day" v-bind="day" />
        </template>
        <template v-if="$slots.heading" #heading="heading">
          <slot name="heading" v-bind="heading" />
        </template>
        <template v-if="$slots['week-day']" #week-day="weekDay">
          <slot name="week-day" v-bind="weekDay" />
        </template>
      </UCalendar>
    </template>
  </UPopover>
</template>
