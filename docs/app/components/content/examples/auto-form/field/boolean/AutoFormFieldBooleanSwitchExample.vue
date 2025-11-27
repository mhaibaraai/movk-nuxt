<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  enabled: afz.boolean({
    type: 'switch'
  })
    .default(true)
    .meta({
      label: '开关',
      hint: '切换功能启用/禁用状态'
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
