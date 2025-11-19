<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { CalendarDate } from '@internationalized/date'

const { afz } = useAutoForm()
const toast = useToast()
const formatter = useDateFormatter()

const schema = afz.object({
  birthDate: afz.date({ controlProps: { labelFormat: 'iso' } })
    .transform(date => formatter.toISO(date))
    .meta({ description: '请选择您的出生日期' }),
  appointmentDate: afz.date().refine(
    date => date > new CalendarDate(2025, 1, 1),
    { message: '日期必须在 2025 年之后' }
  )
    .transform(date => formatter.toTimestamp(date))
    .meta({ label: '预约日期', description: '请选择一个在 2025 年之后的日期' }),
  vacationDate: afz.date({
    controlProps: {
      labelFormat: 'iso',
      buttonProps: { color: 'success' },
      range: true,
      numberOfMonths: 2
    }
  })
    .transform(date => formatter.convertToISO(date))
    .meta({ description: '请选择您的假期日期' })
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
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
