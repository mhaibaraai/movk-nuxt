<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  description: afz.string({
    type: 'textarea',
    controlProps: {
      maxrows: 4,
      autoresize: true
    }
  })
    .min(10, '至少 10 个字符')
    .meta({
      label: '文本域',
      placeholder: '请输入多行文本...',
      hint: '自动调整高度，最多 8 行'
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
