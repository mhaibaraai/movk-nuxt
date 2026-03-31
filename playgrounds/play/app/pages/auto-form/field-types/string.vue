<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

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
  <Matrix :form="form" title="字符串字段类型" description="演示各种字符串输入控件，如密码、带清除/复制按钮的输入框等。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
