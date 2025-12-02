<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  search: afz.string({
    type: 'withClear',
    controlProps: {
      icon: 'i-lucide-search'
    }
  })
    .meta({
      label: '带清除按钮',
      placeholder: '输入内容后显示清除按钮',
      hint: '点击清除图标快速清空内容'
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
