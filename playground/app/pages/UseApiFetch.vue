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
  username: number
  nickname: string
  email: string
  roles: string[]
}

const { login, logout, session } = useApiAuth()

const credentials = ref<LoginCredentials>({
  email: 'admin@movk.com',
  password: 'Admin@2025#Secure'
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    await login<LoginCredentials, UserInfo>({
      loginPath: '/api/auth/login',
      credentials: credentials.value,
      // 登录后获取用户详情
      userInfoPath: '/api/auth/me',
      // 自定义 token 提取
      tokenExtractor: res => (res.data as { accessToken?: string })?.accessToken,
      // 自定义 session 构建
      sessionBuilder: (userInfo, token) => {
        return {
          user: {
            username: userInfo.username,
            nickname: userInfo.nickname,
            email: userInfo.email,
            roles: userInfo.roles
          },
          token,
          loggedInAt: new Date().toISOString()
        }
      }
    })
  }
  finally {
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
}

const { execute: fetchUsers } = await useClientApiFetch('/api/system/users')
</script>

<template>
  <UCard>
    {{ session }}
    <UButton :loading="loading" @click="handleLogin">
      登录
    </UButton>

    <UButton color="error" @click="handleLogout">
      登出
    </UButton>

    <UButton @click="fetchUsers()">
      获取用户列表
    </UButton>
  </UCard>
</template>
