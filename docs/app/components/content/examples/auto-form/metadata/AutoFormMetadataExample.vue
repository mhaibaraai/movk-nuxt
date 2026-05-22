<script setup lang="ts">
import type { z } from 'zod'
import type { AutoFormFieldContext } from '@movk/nuxt'

const { afz } = useAutoForm()

const schema = afz.object({
  label: afz.string({ controlProps: { placeholder: '只设置 label' } }).meta({ label: 'Label' }),
  description: afz.string({ controlProps: { placeholder: '查看字段说明文本' } })
    .meta({ label: 'Description', description: '显示在 label 下方的描述文本' }),
  hint: afz.string({ controlProps: { placeholder: '展示 hint 文本' } }).meta({ label: 'Hint', hint: '可选' }),
  help: afz.string({ controlProps: { placeholder: '查看 help 文本' } })
    .meta({ label: 'Help', help: '没有错误时显示在控件下方的帮助文本' }),
  error: afz.string({ controlProps: { placeholder: '固定显示错误文本' } })
    .meta({ label: 'Error', error: '这是通过 meta.error 设置的错误' }),
  size: afz.string({ controlProps: { placeholder: 'size=xl' } }).meta({ label: 'Size', size: 'xl' }),
  styled: afz.string({ controlProps: { placeholder: 'ui/class 示例' } })
    .meta({
      label: 'UI / Class',
      description: '自定义 UFormField 样式',
      class: 'rounded-md border border-primary/20 p-3',
      ui: { label: 'text-primary', description: 'text-warning' }
    }),
  notify: afz.boolean({ type: 'switch' }).meta({ label: 'If', help: '开启后显示通知邮箱字段' }).default(false),
  email: afz.email({ controlProps: { placeholder: 'demo@movk.dev' } })
    .meta({
      label: '通知邮箱',
      if: ({ state }: AutoFormFieldContext) => Boolean(state.notify),
      required: ({ state }: AutoFormFieldContext) => Boolean(state.notify),
      eagerValidation: true,
      validateOnInputDelay: 200,
      error: '请输入有效邮箱'
    }),
  profile: afz.object({
    nickname: afz.string({ controlProps: { placeholder: '显示名称' } }).meta({ label: '昵称' }),
    website: afz.url({ controlProps: { placeholder: 'https://movk.dev' } }).meta({ label: '个人网站', required: false })
  }).meta({
    label: '更多资料',
    description: '对象字段可以作为可折叠分组渲染',
    collapsible: { defaultOpen: true, unmountOnHide: false }
  }),
  hidden: afz.string().meta({ hidden: true }).default('不会显示但会提交')
})

const state = reactive<Partial<z.output<typeof schema>>>({ hidden: 'secret' })
</script>

<template>
  <MAutoForm :schema="schema" :state="state" />
</template>
