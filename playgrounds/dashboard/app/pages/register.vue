<script lang="ts" setup>
import { WithPasswordStrengthIndicator } from '#components'

definePageMeta({
  layout: 'cert'
})

const { afz } = useAutoForm()

const schema = afz.object({
  email: afz.email({ type: 'withClear', error: '请输入邮箱地址' }).meta({ label: '邮箱' }),
  password: afz.string({ component: WithPasswordStrengthIndicator, error: '请输入密码' }).min(8, '密码至少需要 8 个字符').meta({ label: '密码' }),
  confirmPassword: afz.string({ type: 'withPasswordToggle', error: '请输入确认密码' }).min(8, '确认密码至少需要 8 个字符').meta({ label: '确认密码' })
})
</script>

<template>
  <UPageCard spotlight title="创建新账号 🚀" description="请输入您的信息以注册新帐户" :ui="{ title: 'text-2xl lg:text-3xl font-bold' }">
    <MAutoForm :schema="schema" class="mt-4">
      <template #footer>
        <div class="flex items-center space-x-2">
          <UCheckbox label="我同意" />
          <div class="text-sm text-pretty text-muted">
            <ULink to="#" class="text-primary font-medium">隐私政策 & 条款</ULink>.
          </div>
        </div>
      </template>
    </MAutoForm>

    <div class="text-sm text-pretty text-muted text-center">
      已经有账号? <ULink to="/login" class="text-primary font-medium">登录</ULink>.
    </div>
  </UPageCard>
</template>
