<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  password: afz.string({
    type: 'withPasswordToggle'
  })
    .min(8, '密码至少 8 个字符')
    .meta({
      label: '密码切换',
      placeholder: '请输入密码',
      hint: '点击眼睛图标切换显示/隐藏'
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
