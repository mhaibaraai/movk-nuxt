<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()
const formatter = useDateFormatter()

const schema = afz.object({
  vacation: afz.calendarDate({
    controlProps: {
      labelFormat: 'iso',
      range: true,
      numberOfMonths: 2
    }
  })
    .transform(date => formatter.convertToISO(date))
    .meta({
      label: '日期范围',
      hint: '选择日期范围，显示两个月'
    })
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
