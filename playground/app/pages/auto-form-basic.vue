<script lang="tsx" setup>
import { z } from 'zod/v4'
import TestC from './TestC.vue'

const userSchema = z.object({
  name: z.string().meta({ label: '姓名', class: 'text-red-500', controlProps: {} }),
  surname: z.object({
    first: z.string().meta({ label: '姓氏' }),
    last: z.string().meta({ label: '名字' }),
  }).meta({ label: '姓氏' }),
  tags: z.array(z.string().meta({ label: '标签' })),
  age: z.number().meta({ label: '年龄' }),
  active: z.boolean().meta({ label: '启用' }),
  role: z.enum(['user', 'admin']).meta({
    label: '角色',
    controlProps: {
      items: [
        { label: '用户', value: 'user' },
        { label: '管理员', value: 'admin' },
      ],
    },
  }),
  testC: z.string().meta({ type: 'TestC', label: '测试C' }),
  testC2: z.string().meta({ component: <TestC /> }),
})

const state = ref({})

// function onSubmit(payload: any) {
//   console.log('submit', payload)
// }
</script>

<template>
  <UInput />
  <div class="space-y-4 p-6">
    <pre>{{ state }}</pre>
    <MAutoForm v-model="state" :schema="userSchema" />
  </div>
</template>
