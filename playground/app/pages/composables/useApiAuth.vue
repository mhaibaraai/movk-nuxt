<script setup lang="ts">
import type z from 'zod'

const { afz } = useAutoForm()
const { login, clear, loggedIn, user, session } = useApiAuth()
const { $api } = useNuxtApp()

const schema = afz.object({
  loginPath: afz.string().default('/api/auth/login').meta({ label: '登录接口路径' }),
  userInfoPath: afz.string().default('/api/auth/me').meta({ label: '用户信息接口路径，留空则从登录响应中提取用户信息' }),
  endpoint: afz.string().default('').meta({ label: 'API 端点，留空则使用默认端点' }),
  email: afz.email().default('admin@movk.com').meta({ label: '用户名（邮箱）' }),
  password: afz.string().default('Admin@2025#Secure').meta({ label: '密码' })
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const form = ref({} as Schema)

async function submit() {
  loading.value = true
  try {
    await login({
      loginPath: form.value.loginPath,
      credentials: {
        email: form.value.email,
        password: form.value.password
      },
      userInfoPath: form.value.userInfoPath,
      endpoint: form.value.endpoint,
      sessionBuilder: (userInfo, token, loginResponse) => ({
        user: {
          id: userInfo.id,
          username: userInfo.username,
          nickname: userInfo.nickname,
          email: userInfo.email,
          phone: userInfo.phone
        },
        token,
        loggedInAt: new Date().toISOString(),
        loginResponse
      })
    })
  }
  finally {
    loading.value = false
  }
}

async function logout() {
  loading.value = true
  try {
    await $api.$fetch('/api/auth/logout', {
      method: 'POST',
      onResponse() {
        clear()
      }
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard class="w-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm text-gray-500">登录状态：</span>
          <UBadge :color="loggedIn ? 'success' : 'neutral'">
            {{ loggedIn ? '已登录' : '未登录' }}
          </UBadge>
        </div>
        <UButton
          v-if="loggedIn"
          color="warning"
          :loading="loading"
          @click="logout"
        >
          登出
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="loggedIn && user">
        <dt class="text-sm text-gray-500 mb-2">
          用户信息
        </dt>
        <dd class="font-mono text-sm bg-gray-50 p-3 rounded">
          {{ JSON.stringify(user, null, 2) }}
        </dd>
      </div>

      <div v-if="loggedIn && session">
        <dt class="text-sm text-gray-500 mb-2">
          Session 数据
        </dt>
        <dd class="font-mono text-sm bg-gray-50 p-3 rounded">
          {{ JSON.stringify(session, null, 2) }}
        </dd>
      </div>
    </div>

    <div v-if="!loggedIn" class="space-y-4">
      <MAutoForm :schema="schema" :state="form" @submit="submit" />
    </div>
  </UCard>
</template>
