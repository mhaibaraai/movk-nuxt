<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { TagSelector } from '#components'

const toast = useToast()

const { afz, controls } = useAutoForm({
  tagSelector: {
    component: TagSelector,
    controlProps: { class: 'w-full' }
  }
})

const SKILL_OPTIONS = [
  'Vue.js', 'Nuxt', 'TypeScript', 'React', 'Node.js',
  'Python', 'GraphQL', 'Docker', 'Tailwind CSS', 'Vite'
]

const ROLE_OPTIONS = {
  frontend: '前端开发',
  backend: '后端开发',
  fullstack: '全栈开发',
  devops: 'DevOps',
  designer: 'UI / 设计'
}

const schema = afz.object({
  name: afz
    .string({ controlProps: { placeholder: '请输入您的姓名' } })
    .min(2, '姓名至少 2 个字符')
    .meta({ label: '姓名' }),

  role: afz
    .enum(Object.keys(ROLE_OPTIONS) as [string, ...string[]])
    .default('fullstack')
    .meta({ label: '职位', description: '您的主要技术方向' }),

  skills: afz
    .array(afz.string(), {
      type: 'tagSelector',
      controlProps: {
        options: SKILL_OPTIONS,
        max: 5
      }
    })
    .default([])
    .meta({ label: '技能标签', description: '最多选择 5 项技能' }),

  bio: afz
    .string({
      type: 'textarea',
      controlProps: { placeholder: '简短介绍一下自己...' }
    })
    .optional()
    .meta({ label: '个人简介' }),

  openToWork: afz
    .boolean()
    .default(false)
    .meta({ label: '求职中', hint: '开启后将对招聘者可见' })
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
  <UCard>
    <MAutoForm
      :schema="schema"
      :state="form"
      :controls="controls"
      @submit="onSubmit"
    />
  </UCard>
</template>
