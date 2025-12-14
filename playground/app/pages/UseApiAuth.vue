<script lang="ts" setup>
/**
 * useApiAuth 示例页面
 *
 * 演示完整的登录流程：
 * 1. 调用登录接口获取 token
 * 2. 使用 token 获取用户信息
 * 3. 设置 session
 */

interface LoginCredentials {
  email: string
  password: string
}

interface UserInfo {
  id: number
  name: string
  email: string
  roles: string[]
}

const { login, logout, loggedIn, user, session } = useApiAuth()

const credentials = ref<LoginCredentials>({
  email: 'admin@movk.com',
  password: 'Admin@2025#Secure'
})

const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  try {
    await login<LoginCredentials, UserInfo>({
      loginPath: '/auth/login',
      credentials: credentials.value,
      // 登录后获取用户详情
      userInfoPath: '/auth/me',
      // 自定义 token 提取
      tokenExtractor: (res) => (res.data as { accessToken?: string })?.accessToken,
      // 自定义 session 构建
      sessionBuilder: (userInfo, token) => ({
        user: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          roles: userInfo.roles
        },
        secure: {
          token
        },
        loggedInAt: new Date().toISOString()
      })
    })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  }
  finally {
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          useApiAuth 示例
        </h2>
      </template>

      <!-- 未登录状态 -->
      <div v-if="!loggedIn" class="space-y-4">
        <UFormField label="邮箱">
          <UInput
            v-model="credentials.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </UFormField>

        <UFormField label="密码">
          <UInput
            v-model="credentials.password"
            type="password"
            placeholder="请输入密码"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          :title="error"
        />

        <UButton
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </UButton>
      </div>

      <!-- 已登录状态 -->
      <div v-else class="space-y-4">
        <UAlert color="success" title="登录成功" />

        <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 class="font-medium mb-2">
            用户信息
          </h3>
          <pre class="text-sm">{{ JSON.stringify(user, null, 2) }}</pre>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 class="font-medium mb-2">
            Session 数据
          </h3>
          <pre class="text-sm">{{ JSON.stringify(session, null, 2) }}</pre>
        </div>

        <UButton color="error" @click="handleLogout">
          登出
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
