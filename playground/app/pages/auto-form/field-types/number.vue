<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  integer: afz.number().int(),
  positiveInt: afz.number().int().positive(),
  nonNegative: afz.number().nonnegative(),
  range: afz.number().min(0).max(100),
  step: afz.number({
    controlProps: { step: 0.5 }
  }),
  slider: afz.number({
    type: 'slider',
    controlProps: { min: 0, max: 100, step: 5 }
  }).default(50)
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
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
