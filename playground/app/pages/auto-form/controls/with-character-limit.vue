<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  bio: afz.string({
    type: 'withCharacterLimit',
    controlProps: { maxLength: 100 }
  }).max(100).default('')
    .meta({ hint: '最多100个字符' }),

  tweet: afz.string({
    type: 'withCharacterLimit',
    controlProps: { maxLength: 280 }
  }).max(280).optional().meta({ hint: '最多280个字符' }),

  description: afz.string({
    type: 'textarea'
  }).max(500).optional().meta({ hint: '最多500个字符' })
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
  <Matrix :form="form" title="带字符限制的输入框" description="使用 `withCharacterLimit` 类型为输入框或文本域添加字符计数和限制功能。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
