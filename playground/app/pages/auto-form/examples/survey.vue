<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  age: afz.number().int().min(1).max(120),
  gender: afz.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  interests: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      orientation: 'horizontal',
      items: [
        { label: '科技', value: 'tech' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '阅读', value: 'reading' }
      ]
    }
  }),
  satisfaction: afz.number({
    type: 'slider',
    controlProps: { min: 1, max: 5, step: 1 }
  }).default(3),
  feedback: afz.string({ type: 'textarea' }).optional()
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
