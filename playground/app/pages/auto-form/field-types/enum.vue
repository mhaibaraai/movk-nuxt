<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const Fruits = ['apple', 'banana', 'orange'] as const

const schema = afz.object({
  basicEnum: afz.enum(['active', 'inactive', 'pending']).default('active'),

  select: afz.enum(Fruits, {
    controlProps: { placeholder: '选择水果' }
  }),

  selectMenu: afz.enum(['apple', 'banana', 'orange'], {
    type: 'selectMenu',
    controlProps: {
      placeholder: '选择水果',
      items: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' }
      ]
    }
  }),

  radioGroup: afz.enum(['small', 'medium', 'large'], {
    type: 'radioGroup',
    controlProps: {
      items: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ]
    }
  }).default('medium')
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
