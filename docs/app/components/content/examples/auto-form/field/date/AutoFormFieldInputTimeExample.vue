<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  meetingTime: afz.inputTime()
    .refine(
      time => time.hour >= 9 && time.hour < 18,
      { message: '会议时间必须在工作时间内 (9:00-18:00)' }
    )
    .transform(time => `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`)
    .meta({
      label: '会议时间',
      description: '请选择会议时间（工作时间内）'
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
