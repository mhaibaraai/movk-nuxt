<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()
const toast = useToast()

const loginSchema = z.object({
  email: afz.email({ label: '邮箱', controlProps: { placeholder: 'demo@movk.dev' } }),
  password: afz.string({ type: 'withPasswordToggle', label: '密码' }).min(6),
  remember: afz.boolean({ type: 'switch', label: '记住我' })
})
const loginState = reactive<Partial<z.input<typeof loginSchema>>>({})

async function login() {
  await new Promise(r => setTimeout(r, 1500))
  toast.add({ title: '登录成功', color: 'success' })
}

const registerSchema = z.object({
  account: afz.object({
    username: afz.string({ label: '用户名' }).min(3),
    password: afz.string({ type: 'withPasswordToggle', label: '密码' }).min(8),
    confirm: afz.string({ type: 'withPasswordToggle', label: '确认密码' }).min(8)
  }, { label: '账号信息' }),
  profile: afz.object({
    name: afz.string({ label: '昵称' }),
    phone: afz.string({ type: 'asPhoneNumberInput', label: '手机' }),
    interests: afz.array(afz.string(), {
      type: 'inputTags',
      label: '兴趣标签'
    }).default([])
  }, { label: '个人资料' }),
  agreement: afz.boolean({ label: '同意条款' }).refine(v => v === true, { message: '必须同意条款' })
}).refine(d => d.account.password === d.account.confirm, {
  message: '两次密码不一致',
  path: ['account', 'confirm']
})
const registerState = reactive<Partial<z.input<typeof registerSchema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="登录表单" description="loadingAuto 自动管理 submit 按钮 loading 状态" :state="loginState">
      <MAutoForm
        :schema="loginSchema"
        :state="loginState"
        :submit-button-props="{ block: true, label: '登 录' }"
        @submit="login"
      />
    </Showcase>

    <Showcase
      title="多步注册"
      description="嵌套 object + 跨字段 refine 校验密码一致"
      :state="registerState"
    >
      <MAutoForm :schema="registerSchema" :state="registerState" />
    </Showcase>
  </div>
</template>
