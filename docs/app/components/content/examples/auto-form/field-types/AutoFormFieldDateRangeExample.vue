<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  vacation: afz.calendarDate({
    controlProps: {
      labelFormat: 'iso',
      range: true,
      valueFormat: 'iso',
      numberOfMonths: 2
    }
  })
    .meta({
      label: '日期范围',
      hint: '选择日期范围，显示两个月'
    })
})
type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
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
