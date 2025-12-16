<script lang="ts" setup>
const { login, clear } = useApiAuth()

const credentials = ref({
  email: 'admin@movk.com',
  password: 'Admin@2025#Secure'
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    await login<{ accessToken?: string }>({
      loginPath: '/api/auth/login',
      credentials: credentials.value,
      userInfoPath: '/api/auth/me',
      tokenExtractor: res => res.data?.accessToken,
      sessionBuilder: (userInfo, token) => ({
        user: {
          id: userInfo.id,
          username: userInfo.username,
          nickname: userInfo.nickname,
          email: userInfo.email,
          phone: userInfo.phone
        },
        token
      })
    })
  }
  finally {
    loading.value = false
  }
}

async function handleLogout() {
  await clear()
}

const { execute: fetchUsers } = await useClientApiFetch('/api/system/users')
</script>

<template>
  <UCard>
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
