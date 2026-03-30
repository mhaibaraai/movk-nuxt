<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  user: afz.object({
    name: afz.string(),
    email: afz.email()
  }).meta({ label: '用户信息', collapsible: { defaultOpen: true } }),
  address: afz.object({
    street: afz.string(),
    city: afz.string(),
    zipCode: afz.string()
  }).optional().meta({ label: '地址信息' })
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
  <Matrix :form="form" title="嵌套对象字段" description="演示如何处理嵌套的对象结构，并支持折叠。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
