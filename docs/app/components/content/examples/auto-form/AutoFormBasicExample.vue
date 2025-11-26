<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/),
  email: afz.email({
    controlProps: { leadingIcon: 'i-lucide-mail', placeholder: '请输入您的邮箱' },
    error: '请输入有效的邮箱地址'
  }).meta({ hint: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' })
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
  confirmPassword: afz.string({ type: 'withPasswordToggle' }),
  acceptTerms: afz.boolean({
    controlProps: { label: '我同意服务条款和隐私政策', required: true }
  })
}).refine(
  data => data.password === data.confirmPassword,
  { message: '两次密码不一致', path: ['confirmPassword'] }
).refine(
  data => data.acceptTerms === true,
  { message: '必须同意条款', path: ['acceptTerms'] }
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
  <UCard class="w-lg">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
