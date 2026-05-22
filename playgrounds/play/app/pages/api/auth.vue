<script setup lang="ts">
const { session, loggedIn, fetch: refreshSession } = useUserSession()
const { $api } = useNuxtApp()
const publicConfig = useRuntimeConfig().public.movkApi

const loginPending = ref(false)
const logoutPending = ref(false)

const protectedRes = useApiFetch('/demo/protected', { immediate: false })

async function login() {
  loginPending.value = true
  try {
    await $api('/demo/login', { method: 'POST' })
    await refreshSession()
  }
  finally {
    loginPending.value = false
  }
}

async function logout() {
  logoutPending.value = true
  try {
    await $api('/demo/logout', { method: 'POST' })
    await refreshSession()
  }
  finally {
    logoutPending.value = false
  }
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <UBadge :color="loggedIn ? 'success' : 'neutral'" variant="subtle">
        {{ loggedIn ? '已登录' : '未登录' }}
      </UBadge>
      <UButton
        v-if="!loggedIn"
        size="sm"
        :loading="loginPending"
        icon="i-lucide-log-in"
        @click="login"
      >
        登录（写入 session.token）
      </UButton>
      <UButton
        v-else
        size="sm"
        color="error"
        variant="outline"
        :loading="logoutPending"
        icon="i-lucide-log-out"
        @click="logout"
      >
        登出（清除 session）
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        title="当前 session"
        description="useUserSession 暴露的 session.value，认证拦截器从 sessionTokenPath 读取 token"
        :state="session"
      >
        <p class="text-sm text-muted">
          sessionTokenPath: {{ publicConfig.auth?.sessionTokenPath }}
        </p>
      </Showcase>

      <Showcase
        title="调用受保护接口"
        description="useApiFetch 携带 Authorization 头访问 /demo/protected；未登录时返回 401"
        :state="protectedRes.error.value
          ? { statusCode: protectedRes.error.value.statusCode, message: protectedRes.error.value.message }
          : protectedRes.data.value"
      >
        <UButton
          size="sm"
          icon="i-lucide-shield-check"
          @click="protectedRes.execute()"
        >
          请求 /demo/protected
        </UButton>
      </Showcase>

      <Showcase
        title="401 处理策略"
        description="auth.unauthorized 控制 401 时的 redirect / clearSession 行为；当前 playground 关闭重定向便于演示"
        :state="publicConfig.auth?.unauthorized"
      >
        <p class="text-sm text-muted">
          生产中可启用 redirect: true 与 loginPath 自动跳转
        </p>
      </Showcase>

      <Showcase
        title="令牌注入格式"
        description="headerName + tokenType 决定最终请求头形态；后端 echo authHeader 字段供核对"
        :state="{
          headerName: publicConfig.auth?.headerName ?? 'Authorization',
          tokenType: publicConfig.auth?.tokenType ?? 'Bearer',
          echoed: protectedRes.data.value && typeof protectedRes.data.value === 'object'
            ? (protectedRes.data.value as { authHeader?: string }).authHeader
            : null
        }"
      >
        <p class="text-sm text-muted">
          登录后再次请求受保护接口，可在 echoed 字段看到拦截器注入的 Authorization 值
        </p>
      </Showcase>
    </div>
  </div>
</template>
