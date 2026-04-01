<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  email: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '邮箱地址',
      leadingIcon: 'i-lucide-mail',
      type: 'email'
    }
  }),

  username: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '用户名',
      leadingIcon: 'i-lucide-user'
    }
  }),

  password: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '密码',
      leadingIcon: 'i-lucide-lock',
      type: 'password'
    }
  })
})

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
  <Matrix :form="form" title="浮动标签输入框" description="使用 `withFloatingLabel` 类型为输入框提供浮动标签和一键清除体验。">
    <MAutoForm
      :global-meta="{
        label: '',
        required: false
      }"
      :schema="schema"
      :state="form"
      @submit="onSubmit"
    />
  </Matrix>
</template>
