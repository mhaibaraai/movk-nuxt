<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  items: afz.array(
    afz.object({
      name: afz.string().meta({ label: '商品名称' }),
      quantity: afz.number().int().default(1).meta({ label: '数量', hint: '默认为 1' }),
      price: afz.number().min(0).meta({ label: '价格' })
    }).meta({ label: '商品', hint: '请填写商品信息' })
  ).default([
    { name: '苹果', quantity: 2, price: 5.99 },
    { name: '香蕉', quantity: 1, price: 3.99 }
  ]).meta({ label: '商品列表' })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard>
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        collapsible: { defaultOpen: true }
      }"
      :add-button-props="{
        color: 'primary',
        variant: 'soft',
        block: false
      }"
      @submit="onSubmit"
    />
  </UCard>
</template>
