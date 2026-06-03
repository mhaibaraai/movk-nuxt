<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  scheduledDate: afz.isoDate()
    .meta({
      label: '计划日期',
      description: '输入 ISO 格式日期 (YYYY-MM-DD)',
      hint: '例如: 2025-12-31'
    }),
  scheduledTime: afz.isoTime()
    .meta({
      label: '计划时间',
      description: '输入 ISO 格式时间 (HH:MM:SS)',
      hint: '例如: 14:30:00'
    }),
  createdAt: afz.isoDatetime()
    .optional()
    .meta({
      label: '创建时间',
      description: '输入 ISO 8601 完整时间戳',
      hint: '例如: 2025-12-31T14:30:00Z'
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
