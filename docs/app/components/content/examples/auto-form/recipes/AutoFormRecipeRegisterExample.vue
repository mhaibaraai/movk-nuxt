<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  account: afz.object({
    username: afz.string().min(3).meta({ label: '用户名' }),
    password: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '密码' }),
    confirm: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '确认密码' })
  }).meta({ label: '账号信息' }),
  profile: afz.object({
    name: afz.string().meta({ label: '昵称' }),
    phone: afz.string({ type: 'asPhoneNumberInput' }).meta({ label: '手机' }),
    interests: afz.array(afz.string(), { type: 'inputTags' }).default([]).meta({ label: '兴趣标签' })
  }).meta({ label: '个人资料' }),
  agreement: afz.boolean().refine(v => v === true, { message: '必须同意条款' }).meta({ label: '同意条款' })
}).refine(d => d.account?.password === d.account?.confirm, {
  message: '两次密码不一致',
  path: ['account', 'confirm']
})
const state = reactive<Partial<z.input<typeof schema>>>({})

async function onSubmit() {
  await new Promise(r => setTimeout(r, 1200))
  toast.add({ title: '注册成功', color: 'success' })
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state" :submit-button-props="{ label: '注 册' }" @submit="onSubmit" />
</template>
