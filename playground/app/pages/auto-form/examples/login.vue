<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  email: afz.email({
    controlProps: {
      leadingIcon: 'i-tabler-mail',
      placeholder: '请输入您的邮箱'
    }
  }).meta({ hint: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(6)
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

function handleSubmit() {
  toast.add({
    title: '登录成功',
    color: 'success',
    description: JSON.stringify(form.value, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="登录表示例" description="一个基础的登录表单，包含邮箱和密码字段。">
    <MAutoForm :schema="schema" :state="form" @submit="handleSubmit" />
  </Matrix>
</template>
