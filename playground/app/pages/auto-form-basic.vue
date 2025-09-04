<script setup lang="ts">
import { z } from 'zod/v4'

const userSchema = z.object({
  name: z.string().meta({ label: '姓名', type: 'UInput' }),
  age: z.number().meta({ label: '年龄', type: 'UInputNumber' }),
  active: z.boolean().meta({ label: '启用', type: 'USwitch' }),
  role: z.enum(['user', 'admin']).meta({ label: '角色', type: 'USelect', controlProps: { items: [
    { label: '用户', value: 'user' },
    { label: '管理员', value: 'admin' },
  ] } }),
})

const state = reactive({ name: '', age: 18, active: true, role: 'user' as 'user' | 'admin' })

function onSubmit(payload: any) {
  console.log('submit', payload)
}
</script>

<template>
  <div class="space-y-4 p-6">
    <MAutoForm v-model="state" :schema="userSchema" @submit="onSubmit" />
    <pre class="text-xs">{{ state }}</pre>
  </div>
</template>
