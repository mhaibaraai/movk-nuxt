<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  notifications: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      items: [
        { label: '邮件通知', value: 'email' },
        { label: '短信通知', value: 'sms' },
        { label: '推送通知', value: 'push' }
      ]
    }
  }).default(['email']),

  permissions: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      variant: 'card',
      items: [
        { label: '读取', value: 'read' },
        { label: '写入', value: 'write' },
        { label: '删除', value: 'delete' }
      ]
    }
  }).min(1)
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="复选框组" description="使用 `checkboxGroup` 类型来创建一个复选框组，支持多选。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
