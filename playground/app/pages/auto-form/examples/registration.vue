<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/),
  email: afz.email(),
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
</script>

<template>
  <Navbar />
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" />
  </Matrix>
</template>
