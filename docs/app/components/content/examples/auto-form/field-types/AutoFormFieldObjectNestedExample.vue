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

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard>
    <MAutoForm :schema="schema" @submit="onSubmit" />
  </UCard>
</template>
