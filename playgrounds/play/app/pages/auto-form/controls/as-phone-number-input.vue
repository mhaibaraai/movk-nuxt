<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  cnPhone: afz.string({
    type: 'asPhoneNumberInput',
    controlProps: {
      dialCode: '+86',
      mask: '### #### ####'
    }
  }).meta({ hint: '中国大陆手机号格式' }),

  usPhone: afz.string({
    type: 'asPhoneNumberInput',
    controlProps: {
      dialCode: '+1',
      mask: '(###) ###-####'
    }
  }).optional().meta({ hint: '美国号码格式（可选）' }),

  officePhone: afz.string({
    type: 'asPhoneNumberInput'
  }).optional().meta({ hint: '默认掩码格式：(###) ###-####' })
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
  <Matrix :form="form" title="电话号码输入" description="使用 `asPhoneNumberInput` 类型为输入框添加电话号码掩码和区号前缀能力。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
