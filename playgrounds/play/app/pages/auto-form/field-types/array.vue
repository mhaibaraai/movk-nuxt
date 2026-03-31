<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  tags: afz.array(afz.string(), {
    type: 'inputTags'
  }).default(['tag1', 'tag2']),

  numbers: afz.array(afz.number().meta({ label: '数字' }))
    .min(1).max(3)
    .meta({ label: '数字列表 (最少1个，最多3个)' }),

  objectArray: afz.array(
    afz.object({
      name: afz.string(),
      age: afz.number().int().min(0)
    }).meta({ label: '用户' })
  ).default([{ name: 'Alice', age: 25 }])
    .meta({ label: '用户合集' }),

  checkboxGroup: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      items: [
        { label: '邮件', value: 'email' },
        { label: '短信', value: 'sms' },
        { label: '电话', value: 'phone' }
      ]
    }
  }).default(['email'])
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
  <Matrix :form="form" title="数组字段类型" description="演示如何定义和使用不同类型的数组字段，例如标签、数字列表和对象数组。">
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        collapsible: { defaultOpen: true }
      }"
      @submit="onSubmit"
    />
  </Matrix>
</template>
