<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  username: afz.string({
    type: 'withCharacterLimit',
    controlProps: { leadingIcon: 'i-lucide-user', maxLength: 20 }
  }).min(3).max(20),
  email: afz.email(),
  phone: afz.string().optional(),
  website: afz.url().optional(),
  age: afz.number().int().min(18).optional(),
  bio: afz.string({ type: 'textarea' }).max(500).optional()
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
  <Matrix :form="form" title="可选字段" description="通过 `.optional()` 方法将字段标记为可选。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
