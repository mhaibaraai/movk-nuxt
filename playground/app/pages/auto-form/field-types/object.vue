<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  key: 'typicode-users',
  transform: (data: { id: number, name: string }[]) => {
    return data?.map(user => ({
      label: user.name,
      value: String(user.id),
      avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
    }))
  }
})

const schema = afz.object({
  name: afz.string().min(1, '请输入姓名'),
  age: afz.number().min(1).max(150),
  email: afz.email('请输入有效的邮箱地址'),
  user: afz.object({}, {
    type: 'selectMenu',
    controlProps: ({ value }: { value: { avatar: { src: string } } }) => ({
      placeholder: '请选择用户',
      items: users.value,
      avatar: value?.avatar
    })
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix
    :form="form"
    title="对象字段类型"
    description="演示如何使用 `afz.object({}, { type: '...' })` 来处理通用对象类型，通常与 `selectMenu` 结合使用。"
  >
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
