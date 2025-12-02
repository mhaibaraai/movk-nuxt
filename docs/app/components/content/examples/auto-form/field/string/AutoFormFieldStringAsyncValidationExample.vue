<script lang="ts" setup>
import { sleep } from '@movk/core'
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const takenUsernames = ['admin', 'user', 'test', 'demo', 'root']

async function checkUsernameAvailability(username: string): Promise<boolean> {
  await sleep(1000)

  return !takenUsernames.includes(username.toLowerCase())
}

const schema = afz.object({
  username: afz.string()
    .min(3, '用户名至少需要 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^\w+$/, '只能包含字母、数字和下划线')
    .refine(
      async (username) => {
        return await checkUsernameAvailability(username)
      },
      '该用户名已被使用'
    )
    .meta({
      label: '用户名',
      placeholder: '请输入用户名',
      hint: 'admin, user, test (已被占用)'
    }).default('admin'),

  email: afz.email('请输入有效的邮箱地址')
    .refine(
      async (email) => {
        await sleep(800)
        const takenEmails = ['admin@example.com', 'test@example.com']
        return !takenEmails.includes(email.toLowerCase())
      },
      '该邮箱已被注册'
    )
    .meta({
      label: '邮箱',
      placeholder: 'your@email.com',
      hint: 'admin@example.com (已被注册)'
    }).default('admin@example.com')
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '验证通过',
    color: 'success',
    description: `用户名: ${event.data.username}\n邮箱: ${event.data.email}`
  })
}
</script>

<template>
  <UCard>
    <MAutoForm
      ref="autoFormRef"
      :schema="schema"
      :state="form"
      @submit="onSubmit"
    />
  </UCard>
</template>
