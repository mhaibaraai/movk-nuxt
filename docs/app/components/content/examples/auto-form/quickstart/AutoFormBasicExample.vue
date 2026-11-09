<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  username: afz.string().min(3).max(20).meta({ label: '用户名' }),
  email: afz.email({ controlProps: { leadingIcon: 'i-lucide-mail' } }).meta({ label: '邮箱' }),
  role: afz.enum(['admin', 'editor', 'viewer']).default('viewer').meta({ label: '角色' }),
  bio: afz.string({ type: 'textarea' }).optional().meta({ label: '简介' })
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await new Promise(resolve => setTimeout(resolve, 800))
  toast.add({ title: '提交成功', color: 'success', description: JSON.stringify(event.data) })
}
</script>

<template>
  <MAutoForm v-model="state" :schema="schema" @submit="onSubmit" />
</template>
