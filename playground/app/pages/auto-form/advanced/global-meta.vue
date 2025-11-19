<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  $gridLayout: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      name: afz.string().min(2).meta({ label: '姓名', description: '请输入您的真实姓名' }),
      email: afz.email().meta({ label: '邮箱地址', description: '用于接收通知和重置密码' }),
      age: afz.number().min(18).max(100).meta({ label: '年龄', hint: '必须年满 18 岁' }),
      username: afz.string().min(3).max(20).meta({ label: '用户名', description: '用于登录系统的唯一标识' }),
      password: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '密码', hint: '至少 8 个字符' }),
      confirmPassword: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '确认密码', hint: '请再次输入密码' }),
      theme: afz.enum(['light', 'dark', 'auto']).meta({ label: '主题', description: '选择您喜欢的界面主题' }),
      language: afz.enum(['zh-CN', 'en-US', 'ja-JP']).meta({ label: '语言', description: '选择界面显示语言' }),
      notifications: afz.boolean().meta({ label: '接收通知', hint: '是否接收系统推送通知', class: 'col-span-2' }),
      bio: afz.string({ type: 'textarea', controlProps: { rows: 4 } }).max(500).meta({
        label: '个人简介',
        hint: '介绍一下您自己',
        class: 'col-span-2'
      })
    }
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
  <Matrix :form="form">
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        size: 'sm',
        required: true,
        validateOnInputDelay: 300,
        ui: {
          wrapper: 'mb-4'
        }
      }"
      @submit="onSubmit"
    />
  </Matrix>
</template>
