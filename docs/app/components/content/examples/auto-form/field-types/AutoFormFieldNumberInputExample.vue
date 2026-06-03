<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  count: afz.number()
    .int('必须是整数')
    .min(0, '不能小于 0')
    .max(100, '不能大于 100')
    .meta({
      label: '数字输入',
      placeholder: '请输入 0-100 的整数',
      hint: '支持步长、范围限制等配置'
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
