<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  username: afz.string('请输入用户名')
    .min(3, '至少3个字符')
    .max(20, '最多20个字符')
    .regex(/^\w+$/, '只能包含字母、数字和下划线')
    .meta({ label: '用户名', description: '只能包含字母、数字和下划线，长度3-20个字符' }),

  email: afz.email('请输入有效的邮箱').meta({ label: '邮箱' }),

  password: afz.string({ type: 'withPasswordToggle' })
    .min(8, '至少8个字符')
    .regex(/[A-Z]/, '必须包含大写字母')
    .regex(/[a-z]/, '必须包含小写字母')
    .regex(/\d/, '必须包含数字')
    .meta({ label: '密码' }),

  age: afz.number()
    .int()
    .min(18, '必须年满18岁')
    .max(100)
    .meta({ label: '年龄' })
}).refine(
  data => !data.password?.toLowerCase().includes(data.username?.toLowerCase() || ''),
  { message: '密码不能包含用户名', path: ['password'] }
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
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
