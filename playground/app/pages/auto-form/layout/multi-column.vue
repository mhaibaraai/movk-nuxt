<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $layout: afz.layout({
    class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    fields: {
      title: afz.string().meta({ class: 'col-span-full' }),
      firstName: afz.string(),
      lastName: afz.string(),
      email: afz.email(),
      description: afz.string({ type: 'textarea' }).meta({ class: 'col-span-full' })
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
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
