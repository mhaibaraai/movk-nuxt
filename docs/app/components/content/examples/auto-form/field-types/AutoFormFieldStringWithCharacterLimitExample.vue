<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  title: afz.string({
    type: 'withCharacterLimit',
    controlProps: {
      maxlength: 50
    }
  })
    .max(50, '最多 50 个字符')
    .meta({
      label: '字符限制',
      placeholder: '请输入标题',
      hint: '实时显示剩余字符数'
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
