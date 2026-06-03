<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import type { AutoFormFieldContext } from '@movk/nuxt'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  accountType: afz
    .enum(['personal', 'business'])
    .default('personal')
    .meta({ label: '账户类型', description: '切换后观察 company/tax 字段的挂载与卸载' }),

  username: afz
    .string({ controlProps: { placeholder: '请输入用户名' } })
    .min(3, '用户名至少需要 3 个字符')
    .meta({ label: '用户名' }),

  companyName: afz
    .string({ controlProps: { placeholder: '请输入公司名称' } })
    .meta({
      label: '公司名称（if）',
      hint: 'if：仅企业账户挂载，个人账户下字段不创建、不参与校验',
      if: ({ state }: AutoFormFieldContext) => state?.accountType === 'business'
    }),

  taxId: afz
    .string({ controlProps: { placeholder: '请输入税号' } })
    .meta({
      label: '税号（if）',
      hint: 'if：与公司名称同条件挂载',
      if: ({ state }: AutoFormFieldContext) => state?.accountType === 'business'
    }),

  agreeToTerms: afz
    .boolean()
    .default(false)
    .meta({ label: '同意服务条款', description: '勾选后下方订阅字段显示' }),

  newsletter: afz
    .boolean()
    .default(true)
    .meta({
      label: '订阅邮件通知（hidden）',
      description: 'hidden：未同意条款时隐藏，但字段始终保留在 DOM 与表单数据中',
      hidden: ({ state }: AutoFormFieldContext) => !state?.agreeToTerms
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
  <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
</template>
