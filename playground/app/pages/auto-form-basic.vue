<script lang="tsx" setup>
import type { AutoFormControls } from '#movk/types'
import { UInputNumber } from '#components'
import { z } from 'zod/v4'

interface ApiUser {
  name: string
  age: number
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  phone: string
  role: 'user' | 'admin'
}

const controls = {
  test: createControl({ component: UInputNumber, props: {
    class: 'w-full',
  } }),
} satisfies AutoFormControls

const afz = createAutoFormZ(controls)

const userSchema = afz.objectOf<ApiUser>()({
  name: z.string().meta({ label: '姓名', class: 'text-red-500', fieldSlots: {
    help: () => h('span', 'help'),
    description: () => h('span', 'description'),
  } }),
  age: z.number().meta({ label: '年龄' }),
  email: z.email().meta({ label: '邮箱' }),
  address: afz.objectOf<ApiUser['address']>()({
    street: z.string().meta({ label: '街道' }),
    city: z.string().meta({ label: '城市' }),
    state: z.string().meta({ label: '省份' }),
    zip: z.string().meta({ label: '邮编' }),
  }).meta({ label: '地址' }),
  phone: z.string().meta({ label: '电话' }),
  role: z.enum(['user', 'admin']).meta({
    label: '角色',
    controlProps: {
      class: 'w-full',
      items: [
        { label: '用户', value: 'user' },
        { label: '管理员', value: 'admin' },
      ],
    },
  }),
})

const state = ref({
  email: '2222@gmail.com',
  role: 'user',
})

// function onSubmit(payload: any) {
//   console.log('submit', payload)
// }
</script>

<template>
  <div class="space-y-4 p-6">
    <pre>{{ state }}</pre>
    <MAutoForm v-model="state" :schema="userSchema" size="lg" :controls="controls">
      <template #help:email="{ ...props }">
        <div class="text-red-500">
          {{ props }}
        </div>
      </template>
    </MAutoForm>
  </div>
</template>
