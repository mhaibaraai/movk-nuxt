<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { CalendarDate } from '@internationalized/date'

const { afz } = useAutoForm()
const toast = useToast()
const formatter = useDateFormatter()

const schema = afz.object({
  birthDate: afz.calendarDate({ controlProps: { labelFormat: 'iso' } })
    .transform(date => formatter.toISO(date))
    .meta({ description: '请选择您的出生日期' }),

  appointmentDate: afz.calendarDate().refine(
    date => date > new CalendarDate(2025, 1, 1),
    { message: '日期必须在 2025 年之后' }
  )
    .transform(date => formatter.toTimestamp(date))
    .meta({ label: '预约日期', description: '请选择一个在 2025 年之后的日期' }),

  vacationDate: afz.calendarDate({
    controlProps: {
      labelFormat: 'iso',
      buttonProps: { color: 'success' },
      range: true,
      numberOfMonths: 2
    }
  })
    .transform(date => formatter.convertToISO(date))
    .meta({ description: '请选择您的假期日期' }),

  inputDate: afz.inputDate()
    .transform(date => formatter.convertToISO(date))
    .meta({ description: '使用输入框选择日期' }),

  inputTime: afz.inputTime()
    .transform(date => formatter.convertToISO(date))
    .meta({ description: '使用输入框选择时间' }),

  // 使用 isoDatetime() - 验证 ISO 8601 字符串
  isoDatetime: afz.isoDatetime()
    .meta({ description: 'ISO 8601 日期时间字符串(如 2025-12-01T06:15:00Z)' }),

  // 使用 isoDate() - 验证日期字符串
  isoDate: afz.isoDate()
    .meta({ description: 'ISO 日期字符串(如 2025-12-01)' }),

  // 使用 isoTime() - 验证时间字符串
  isoTime: afz.isoTime()
    .meta({ description: 'ISO 时间字符串(如 14:30:00)' })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="日期字段类型" description="演示日期选择器，支持单选、范围选择和日期格式化。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
