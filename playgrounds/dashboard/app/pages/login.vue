<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

definePageMeta({
  layout: 'cert'
})

const { fetch: fetchSession } = useUserSession()
const { afz } = useAutoForm()
const { $api } = useNuxtApp()

const userCredentials = {
  admin: {
    email: 'admin@movk.com',
    password: 'Admin@2025#Secure'
  },
  user: {
    email: 'user@movk.com',
    password: 'User@2025#Normal'
  },
  test: {
    email: 'test@movk.com',
    password: 'Test@2025#Demo'
  }
} as const

type UserType = keyof typeof userCredentials

const schema = afz.object({
  user: afz.enum(['admin', 'user', 'test'] as const).meta({ label: '选择用户' }),
  email: afz.email({ type: 'withClear', error: '请输入邮箱地址' }).meta({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle', error: '请输入密码' }).min(8, '密码至少需要 8 个字符').meta({ label: '密码' }),
  verify: afz.boolean({ type: 'slideVerify', error: '请完成滑动验证' }).meta({ label: '' })
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({
  user: 'admin',
  email: userCredentials.admin.email,
  password: userCredentials.admin.password
})

watch(() => state.value.user, (userType) => {
  if (userType && userType in userCredentials) {
    const credentials = userCredentials[userType as UserType]
    state.value.email = credentials.email
    state.value.password = credentials.password
  }
})

const rememberMe = ref(false)
const loading = ref(false)

async function handleSubmit({ data }: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const loginPayload = await $api<LoginPayload>('/v1/auth/login', {
      method: 'POST',
      body: {
        email: data.email,
        password: data.password,
        rememberMe: rememberMe.value
      }
    })

    await $fetch('/api/jwt/create', {
      method: 'POST',
      body: {
        loginPayload,
        rememberMe: rememberMe.value
      }
    })

    await fetchSession()
    navigateTo('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPageCard
    spotlight
    title="欢迎回来 👋🏻"
    description="请输入您的帐户信息以开始管理您的项目"
    :ui="{ title: 'text-2xl lg:text-3xl font-bold' }"
  >
    <MAutoForm :schema="schema" :state="state" :loading="loading" class="mt-4" @submit="handleSubmit">
      <template #footer>
        <div class="flex justify-between items-center">
          <UCheckbox v-model="rememberMe" label="记住我" />
          <UButton variant="link" size="sm">
            忘记密码？
          </UButton>
        </div>
      </template>
    </MAutoForm>

    <USeparator label="其他登录方式" class="mt-3" />

    <div class="flex justify-center">
      <UButton color="neutral" variant="ghost" icon="i-simple-icons-github" />
      <UButton color="neutral" variant="ghost" icon="i-simple-icons-google" />
    </div>

    <div class="text-sm text-pretty text-muted text-center">
      还没有账号? <ULink to="/register" class="text-primary font-medium">注册</ULink>.
    </div>
  </UPageCard>
</template>
