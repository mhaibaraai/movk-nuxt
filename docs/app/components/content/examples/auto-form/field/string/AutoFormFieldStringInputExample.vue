<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  text: afz.string({
    controlProps: {
      icon: 'i-lucide-text'
    }
  })
    .min(3, '至少 3 个字符')
    .max(20, '最多 20 个字符')
    .meta({
      label: '基础输入框',
      placeholder: '请输入文本',
      hint: '支持图标、颜色等配置'
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
