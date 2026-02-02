<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const toast = useToast()
const { afz } = useAutoForm()

const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const taken = ['admin', 'user', 'test']
  return !taken.includes(username.toLowerCase())
}

const schema = afz.object({
  username: afz.string({
    controlProps: { placeholder: '用户名不能与已存在的用户重复' }
  }).min(3).meta({ hint: 'admin, user, test' }),
  email: afz.email().default('test@example.com')
}).refine(
  async (data) => {
    if (!data.username) return true
    return await checkUsernameAvailable(data.username)
  },
  {
    message: '该用户名已被占用',
    path: ['username']
  }
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
  <Matrix :form="form" title="异步验证" description="演示如何使用异步验证来检查表单字段的唯一性或在提交前执行复杂验证。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
