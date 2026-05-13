<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const autoForm = useTemplateRef('autoForm')

const richSchema = afz.object({
  label: afz.string({ controlProps: { placeholder: '只设置 label' } })
    .meta({ label: 'Label' }),
  description: afz.string({ controlProps: { placeholder: '查看字段说明文本' } })
    .meta({ label: 'Description', description: '显示在 label 下方的描述文本' }),
  hint: afz.string({ controlProps: { placeholder: '查看右侧 hint' } })
    .meta({ label: 'Hint', hint: '可选' }),
  help: afz.string({ controlProps: { placeholder: '查看 help 文本' } })
    .meta({ label: 'Help', help: '没有错误时显示在控件下方的帮助文本' }),
  error: afz.string({ controlProps: { placeholder: '固定显示错误文本' } })
    .meta({ label: 'Error', error: '这是通过 meta.error 设置的错误' }),
  errorPattern: afz.string({ controlProps: { placeholder: '错误名可通过正则匹配' } })
    .meta({ label: 'Error pattern', errorPattern: /^errorPattern(?:\.\d+)?$/ }),
  size: afz.string({ controlProps: { placeholder: 'size=xl' } })
    .meta({ label: 'Size', size: 'xl' }),
  orientation: afz.string({ controlProps: { placeholder: 'orientation=horizontal' } })
    .meta({ label: 'Orientation', orientation: 'horizontal' }),
  styled: afz.string({ controlProps: { placeholder: 'ui/class 示例' } })
    .meta({
      label: 'UI / Class',
      description: '自定义 UFormField 样式',
      class: 'rounded-md border border-primary/20 p-3',
      ui: {
        label: 'text-primary',
        description: 'text-warning'
      }
    }),
  required: afz.string({ controlProps: { placeholder: 'required=false' } })
    .meta({ label: 'Required', required: false }),
  bio: afz.string({ type: 'textarea', controlProps: { rows: 4, placeholder: '输入内容查看 help slot' } })
    .meta({
      label: 'Field slots',
      fieldSlots: {
        help: ({ value }) => `当前长度：${String(value ?? '').length}`
      }
    }),
  notify: afz.boolean({ type: 'switch' })
    .meta({
      label: 'If',
      help: '开启后显示通知邮箱字段'
    })
    .default(false),
  email: afz.email({ controlProps: { placeholder: 'demo@movk.dev' } })
    .meta({
      label: '通知邮箱',
      if: ({ state }) => Boolean(state.notify),
      required: ({ state }) => Boolean(state.notify),
      eagerValidation: true,
      validateOnInputDelay: 200,
      error: '请输入有效邮箱'
    }),
  profile: afz.object({
    nickname: afz.string({ controlProps: { placeholder: '显示名称' } })
      .meta({ label: '昵称' }),
    website: afz.url({ controlProps: { placeholder: 'https://movk.dev' } })
      .meta({
        label: '个人网站',
        required: false
      })
  }).meta({
    label: '更多资料',
    description: '对象字段可以作为可折叠分组渲染',
    collapsible: {
      defaultOpen: true,
      unmountOnHide: false
    }
  }),
  hidden: afz.string().meta({ hidden: true }).default('不会显示但会提交')
})

const richState = reactive<Partial<z.output<typeof richSchema>>>({ hidden: 'secret' })
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1">
    <Showcase title="afz.meta()" description="UFormField Props" :state="richState">
      <template #toolbar>
        <UButton size="sm" label="重置" @click="autoForm?.reset()" />
      </template>
      <MAutoForm ref="autoForm" :schema="richSchema" :state="richState" />
    </Showcase>
  </div>
</template>
