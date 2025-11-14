<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  theme: afz.string({
    type: 'radioGroup',
    controlProps: {
      items: [
        { label: '浅色', value: 'light', description: '适合明亮环境' },
        { label: '深色', value: 'dark', description: '适合昏暗环境' },
        { label: '系统', value: 'system', description: '跟随系统设置' }
      ]
    }
  }).default('system'),

  size: afz.string({
    type: 'radioGroup',
    controlProps: {
      variant: 'card',
      items: [
        { label: '小', value: 'sm' },
        { label: '中', value: 'md' },
        { label: '大', value: 'lg' }
      ]
    }
  }).default('md')
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
