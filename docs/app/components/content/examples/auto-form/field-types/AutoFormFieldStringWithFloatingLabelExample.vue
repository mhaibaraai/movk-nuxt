<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  email: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '邮箱地址',
      leadingIcon: 'i-lucide-mail',
      type: 'email'
    }
  })
    .meta({
      label: '',
      hint: '标签会在输入时自动上浮'
    }).optional()
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
