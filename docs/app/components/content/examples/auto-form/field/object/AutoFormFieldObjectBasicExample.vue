<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  key: 'typicode-users-basic',
  transform: (data: { id: number, name: string }[]) => {
    return data?.map(user => ({
      label: user.name,
      value: String(user.id),
      avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
    }))
  }
})

const schema = afz.object({
  name: afz.string().min(1, '请输入姓名').default('张三'),
  age: afz.number().min(1).max(150).default(30),
  email: afz.email('请输入有效的邮箱地址').default('zhangsan@example.com'),
  user: afz.object({
    label: afz.string(),
    value: afz.string(),
    avatar: afz.object({ src: afz.url() })
  }, {
    type: 'selectMenu',
    controlProps: ({ value }: { value: { avatar: { src: string } } }) => ({
      placeholder: '请选择用户',
      items: users.value,
      avatar: value?.avatar
    })
  })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
