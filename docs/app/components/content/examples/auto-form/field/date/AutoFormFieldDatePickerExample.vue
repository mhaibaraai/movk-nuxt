<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { CalendarDate } from '@internationalized/date'

const { afz } = useAutoForm()
const toast = useToast()
const formatter = useDateFormatter()

const schema = afz.object({
  appointmentDate: afz.calendarDate({ controlProps: { labelFormat: 'iso' } })
    .refine(
      date => date > new CalendarDate(2025, 1, 1),
      { message: '日期必须在 2025 年之后' }
    )
    .transform(date => formatter.toTimestamp(date))
    .meta({ label: '预约日期', description: '请选择一个在 2025 年之后的日期' })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
