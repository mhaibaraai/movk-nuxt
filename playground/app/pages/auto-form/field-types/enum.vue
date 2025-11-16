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

  selectMenuAuto: afz.enum([], {
    type: 'selectMenu',
    controlProps: {
      placeholder: '选择水果',
      valueKey: 'value',
      items: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' }
      ]
    }
  }),

  selectMenuNested: afz.enum([], {
    type: 'selectMenu',
    controlProps: {
      placeholder: '选择选项',
      valueKey: 'value',
      items: [
        [
          { label: '分组 1 - 选项 1', value: 'group1-opt1' },
          { label: '分组 1 - 选项 2', value: 'group1-opt2' }
        ],
        [
          { label: '分组 2 - 选项 1', value: 'group2-opt1' },
          { label: '分组 2 - 选项 2', value: 'group2-opt2' }
        ]
      ]
    }
  }),

  radioGroup: afz.enum([], {
    type: 'radioGroup',
    controlProps: {
      valueKey: 'id',
      items: [
        { label: 'System', description: 'This is the first option.', id: 'system' },
        { label: 'Light', description: 'This is the second option.', id: 'light' },
        { label: 'Dark', description: 'This is the third option.', id: 'dark' }
      ]
    }
  }).default('system')
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
