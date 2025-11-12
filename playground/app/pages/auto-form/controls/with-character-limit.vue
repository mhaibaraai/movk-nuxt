<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  bio: afz.string({
    type: 'withCharacterLimit',
    controlProps: { maxlength: 100 }
  }).max(100).default(''),

  tweet: afz.string({
    type: 'withCharacterLimit',
    controlProps: { maxlength: 280 }
  }).max(280).optional(),

  description: afz.string({
    type: 'textarea'
  }).max(500).optional()
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
