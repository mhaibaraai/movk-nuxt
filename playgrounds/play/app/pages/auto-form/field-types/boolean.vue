<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  checkbox: afz.boolean(),
  switch: afz.boolean({ type: 'switch' }).default(true),
  withLabel: afz.boolean({
    controlProps: { label: '同意服务条款' }
  }),
  withDescription: afz.boolean({
    controlProps: {
      label: '接收通知',
      description: '我们会通过邮件向您发送重要更新'
    }
  })
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
  <Matrix :form="form" title="布尔值字段类型" description="演示布尔值字段，可以渲染为复选框或开关。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
