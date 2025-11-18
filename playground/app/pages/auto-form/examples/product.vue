<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  name: afz.string().min(1),
  category: afz.enum(['electronics', 'clothing', 'food', 'other']),
  price: afz.number().min(0),
  stock: afz.number().int().nonnegative(),
  description: afz.string({ type: 'textarea' }).optional(),
  tags: afz.array(afz.string(), {
    type: 'inputTags'
  }).default([]),
  images: afz.array(afz.file(), {
    type: 'file',
    controlProps: { accept: 'image/*', multiple: true, layout: 'list' }
  }).optional(),
  available: afz.boolean({ type: 'switch' }).default(true)
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
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
