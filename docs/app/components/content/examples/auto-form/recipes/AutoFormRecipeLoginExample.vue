<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  email: afz.email({ controlProps: { placeholder: 'demo@movk.dev' } }).meta({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(6).meta({ label: '密码' }),
  remember: afz.boolean({ type: 'switch' }).default(false).meta({ label: '记住我' })
})
const state = reactive<Partial<z.input<typeof schema>>>({})

async function onSubmit() {
  await new Promise(r => setTimeout(r, 1500))
  toast.add({ title: '登录成功', description: `欢迎 ${state.email}`, color: 'success' })
}
</script>

<template>
  <MAutoForm
    :schema="schema"
    :state="state"
    :submit-button-props="{ block: true, label: '登 录' }"
    @submit="onSubmit"
  />
</template>
