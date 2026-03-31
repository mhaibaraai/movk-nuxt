<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  password: afz.string({
    type: 'withPasswordToggle',
    controlProps: { placeholder: '输入密码' }
  }).min(8),

  confirmPassword: afz.string({
    type: 'withPasswordToggle',
    controlProps: { placeholder: '确认密码' }
  }).min(8)
}).refine(
  data => data.password === data.confirmPassword,
  { message: '两次密码不一致', path: ['confirmPassword'] }
)

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
  <Matrix :form="form" title="带密码切换的输入框" description="使用 `withPasswordToggle` 类型为密码输入框添加显示/隐藏密码的功能。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
