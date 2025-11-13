<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  text: afz.string().meta({ label: '文本', hint: '请输入1到5个字符' }),
  textWithClear: afz.string({ type: 'withClear' }).default('可清除的文本'),
  password: afz.string({ type: 'withPasswordToggle' }),
  textToCopy: afz.string({ type: 'withCopy' }).default('复制这段文本'),
  limitedText: afz.string({
    type: 'withCharacterLimit',
    controlProps: { maxLength: 50 }
  }).max(50),
  multiline: afz.string({ type: 'textarea' }).optional(),
  placeholder: afz.string({ controlProps: { placeholder: '自定义占位符' } }).optional()
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
