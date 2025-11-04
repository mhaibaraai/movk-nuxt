<script setup lang="ts" generic="R extends boolean, M extends boolean, P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UCalendar } from '#components'
import type { ButtonProps, PopoverProps, CalendarProps, PopoverEmits, CalendarEmits } from '@nuxt/ui'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
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
}

type DatePickerEmits = PopoverEmits & CalendarEmits<R, M>

const {
  buttonProps,
  popoverProps,
  dateFormatOptions = { dateStyle: 'medium' } as Intl.DateTimeFormatOptions,
  locale = 'zh-CN'
} = defineProps<DatePickerProps>()

const emit = defineEmits<DatePickerEmits>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<CalendarProps<R, M>['modelValue']>()

const df = computed(() => new DateFormatter(locale, dateFormatOptions))
const formattedDate = computed(() => {
  if (!modelValue.value)
    return ''

  if (typeof modelValue.value === 'object' && 'toDate' in modelValue.value) {
    return df.value.format(modelValue.value.toDate(getLocalTimeZone()))
  }

  return ''
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
