<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  accountType: afz
    .enum(['personal', 'business'])
    .default('business')
    .meta({
      label: '账户类型',
      description: '选择个人账户或企业账户'
    }),

  username: afz
    .string({ controlProps: { placeholder: '请输入用户名' } })
    .min(3, '用户名至少需要 3 个字符')
    .meta({ label: '用户名' }),

  email: afz
    .email({ controlProps: { placeholder: 'example@domain.com' }, error: '请输入有效的邮箱地址' })
    .meta({ label: '邮箱地址' }),

  companyName: afz
    .string({ controlProps: { placeholder: '请输入公司名称' } })
    .optional()
    .meta({
      label: '公司名称',
      hint: '仅企业账户需要填写',
      hidden: ({ state }) => state?.accountType !== 'business'
    }),

  taxId: afz
    .string({ controlProps: { placeholder: '请输入税号' } })
    .optional()
    .meta({
      label: '税号',
      hint: '仅企业账户需要填写',
      hidden: ({ state }) => state?.accountType !== 'business'
    }),

  agreeToTerms: afz
    .boolean()
    .default(false)
    .meta({
      label: '同意服务条款',
      description: '我已阅读并同意相关服务条款和隐私政策'
    }),

  newsletter: afz
    .boolean()
    .default(true)
    .meta({
      label: '订阅邮件通知',
      description: '接收产品更新和优惠信息',
      hidden: ({ state }) => !state?.agreeToTerms
    }),

  businessLicense: afz
    .string({ controlProps: { placeholder: '请输入营业执照注册号' } })
    .optional()
    .meta({
      label: '营业执照号码',
      description: '企业账户需要提供有效的营业执照编号',
      if: ({ state }) => state?.accountType === 'business'
    })
})

const form = ref({})
</script>

<template>
  <Navbar />
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" />
  </Matrix>
</template>
