<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  volume: afz.number({
    type: 'slider',
    controlProps: {
      min: 0,
      max: 100,
      step: 5
    }
  })
    .default(50)
    .meta({
      label: '音量滑块',
      hint: '拖动滑块调整数值，步长为 5'
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
