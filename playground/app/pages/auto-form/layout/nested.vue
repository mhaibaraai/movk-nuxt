<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string(),
      lastName: afz.string()
    }
  }),

  $contactInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      email: afz.email(),
      $phoneLayout: afz.layout({
        class: 'grid grid-cols-3 gap-2',
        fields: {
          countryCode: afz.string().default('+86'),
          phoneNumber: afz.string().meta({ class: 'col-span-2' })
        }
      })
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
