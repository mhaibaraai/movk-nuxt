<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  theme: afz.enum([], {
    type: 'radioGroup',
    controlProps: {
      valueKey: 'id',
      items: [
        { label: 'System', description: '跟随系统设置', id: 'system' },
        { label: 'Light', description: '浅色主题', id: 'light' },
        { label: 'Dark', description: '深色主题', id: 'dark' }
      ]
    }
  })
    .default('system')
    .meta({
      label: '单选组'
    })
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
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
