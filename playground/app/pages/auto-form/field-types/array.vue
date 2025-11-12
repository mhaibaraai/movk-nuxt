<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  tags: afz.array(afz.string(), {
    type: 'inputTags'
  }).default(['tag1', 'tag2']),

  numbers: afz.array(afz.number()).min(1).max(5),

  objectArray: afz.array(
    afz.object({
      name: afz.string(),
      age: afz.number().int().min(0)
    })
  ).default([{ name: 'Alice', age: 25 }]),

  checkboxGroup: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      items: [
        { label: '邮件', value: 'email' },
        { label: '短信', value: 'sms' },
        { label: '电话', value: 'phone' }
      ]
    }
  }).default(['email'])
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
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
