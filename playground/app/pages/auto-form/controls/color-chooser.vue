<script lang="ts" setup>
import { UIcon } from '#components'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  primaryColor: afz.string({ type: 'colorChooser' }).default('#3b82f6'),
  secondaryColor: afz.string({ type: 'colorChooser' }).default('#10b981'),
  customColor: afz.string({
    type: 'colorChooser',
    controlProps: {
      buttonProps: {
        color: 'primary',
        label: '自定义 button'
      }
    },
    controlSlots: {
      leading: () => h(UIcon, { name: 'i-lucide-loader', class: 'animate-spin' })
    }
  }).optional()
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
  <Matrix :form="form" title="颜色选择器" description="使用 `colorChooser` 类型来渲染一个颜色选择器，支持多种颜色格式。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
