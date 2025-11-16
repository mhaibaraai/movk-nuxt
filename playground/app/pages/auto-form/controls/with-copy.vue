<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  apiKey: afz.string({ type: 'withCopy' }).default('sk-1234567890abcdef'),
  token: afz.string({ type: 'withCopy' }).default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
  websiteUrl: afz.url({ type: 'withCopy' }).default('https://example.com').meta({ description: '输入要复制的URL' })
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
    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
