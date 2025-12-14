---
title: useApiAuth
description: 与 nuxt-auth-utils 无缝集成的认证 composable，提供登录、登出、刷新用户信息等功能。
---

## Usage

使用自动导入的 `useApiAuth` composable 管理用户认证，与 [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) 无缝集成。

```vue
<script setup lang="ts">
const { login, logout, loggedIn, user } = useApiAuth()

async function handleLogin() {
  await login({
    loginPath: '/auth/login',
    credentials: { username: 'admin', password: '123456' }
  })
}
</script>

<template>
  <div>
    <div v-if="loggedIn">
      <p>欢迎，{{ user?.name }}</p>
      <UButton @click="logout">登出</UButton>
    </div>
    <div v-else>
      <UButton @click="handleLogin">登录</UButton>
    </div>
  </div>
</template>
```

- `useApiAuth` 封装了完整的登录流程：调用登录接口、提取 token、获取用户信息、设置 session。
- Token 存储在 session 的 `secure` 字段中，仅服务端可访问，确保安全性。
- 用户信息存储在 session 的 `user` 字段中，客户端可访问。

::note
使用 `useApiAuth` 需要安装并配置 `nuxt-auth-utils` 模块。
::

## 前置要求

### 安装 nuxt-auth-utils

```bash
pnpm add nuxt-auth-utils
```

### 配置模块

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils', '@movk/nuxt']
})
```

### 配置 Session Secret

```bash
# .env
NUXT_SESSION_PASSWORD=your-session-secret-at-least-32-characters
```

## API

### useApiAuth()

`useApiAuth(): UseApiAuthReturn`{lang="ts-type"}

创建认证管理器实例。

#### Returns

::field-group
  ::field{name="login" type="<TCredentials, TUser>(options: LoginOptions) => Promise<LoginResult>"}
  执行登录流程。
  ::

  ::field{name="logout" type="() => Promise<void>"}
  登出并清除 session。
  ::

  ::field{name="refreshUser" type="<TUser>(userInfoPath: string, endpoint?: string) => Promise<TUser>"}
  刷新用户信息。
  ::

  ::field{name="refreshSession" type="() => Promise<void>"}
  刷新 session 状态。
  ::

  ::field{name="session" type="Ref<SessionData | null>"}
  当前 session 数据。
  ::

  ::field{name="loggedIn" type="ComputedRef<boolean>"}
  是否已登录。
  ::

  ::field{name="user" type="ComputedRef<Record<string, unknown> | null>"}
  当前用户信息。
  ::
::

### login()

`login<TCredentials, TUser>(options: LoginOptions<TCredentials, TUser>): Promise<LoginResult<TUser>>`{lang="ts-type"}

执行完整的登录流程。

#### Parameters

::field-group
  ::field{name="loginPath" type="string" required}
  登录接口路径。
  ::

  ::field{name="credentials" type="TCredentials" required}
  登录凭证。
  ::

  ::field{name="userInfoPath" type="string"}
  用户信息接口路径。如果设置，登录成功后会自动调用此接口获取用户详情。
  ::

  ::field{name="tokenExtractor" type="(response: ApiResponse) => string | null | undefined"}
  自定义 token 提取函数。默认尝试从 `data.token`、`data.accessToken`、`token` 中提取。
  ::

  ::field{name="sessionBuilder" type="(userInfo: TUser, token: string) => SessionData"}
  自定义 session 构建函数。
  ::

  ::field{name="endpoint" type="string"}
  使用的 API 端点名称。
  ::
::

#### 登录流程

1. **调用登录接口** - POST 请求发送凭证
2. **提取 Token** - 从响应中提取 token
3. **获取用户信息** - 如果配置了 `userInfoPath`，使用 token 调用用户信息接口
4. **构建 Session** - 使用 `sessionBuilder` 构建 session 数据
5. **设置 Session** - 通过服务端 API 设置 nuxt-auth-utils session
6. **刷新状态** - 刷新客户端 session 状态

### refreshUser()

`refreshUser<TUser>(userInfoPath: string, endpoint?: string): Promise<TUser>`{lang="ts-type"}

重新获取用户信息并更新 session。

```ts
const { refreshUser } = useApiAuth()

// 用户信息更新后刷新
await refreshUser('/auth/me')
```

## Example

### 基础登录

```vue
<script setup lang="ts">
const { login, logout, loggedIn, user } = useApiAuth()

const credentials = ref({
  username: '',
  password: ''
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await login({
      loginPath: '/auth/login',
      credentials: credentials.value
    })
    navigateTo('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <div v-if="loggedIn" class="flex items-center gap-4">
    <span>{{ user?.name }}</span>
    <UButton variant="ghost" @click="handleLogout">登出</UButton>
  </div>

  <UForm v-else @submit="handleLogin">
    <UFormField label="用户名">
      <UInput v-model="credentials.username" />
    </UFormField>
    <UFormField label="密码">
      <UInput v-model="credentials.password" type="password" />
    </UFormField>
    <UButton type="submit" :loading="loading">登录</UButton>
  </UForm>
</template>
```

### 登录后获取用户详情

```ts
const { login } = useApiAuth()

// 登录接口返回 token，用户信息接口返回详细用户数据
await login({
  loginPath: '/auth/login',
  credentials: { username: 'admin', password: '123456' },
  userInfoPath: '/auth/me' // 使用 token 调用此接口获取用户信息
})
```

### 自定义 Token 提取

```ts
const { login } = useApiAuth()

// 后端返回格式：{ code: 200, result: { accessToken: 'xxx' } }
await login({
  loginPath: '/auth/login',
  credentials: { username: 'admin', password: '123456' },
  tokenExtractor: (response) => {
    return (response.result as { accessToken?: string })?.accessToken
  }
})
```

### 自定义 Session 构建

```ts
interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

const { login } = useApiAuth()

await login<{ username: string; password: string }, User>({
  loginPath: '/auth/login',
  credentials: { username: 'admin', password: '123456' },
  userInfoPath: '/auth/me',
  sessionBuilder: (userInfo, token) => ({
    // 公开信息（客户端可访问）
    user: {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      roles: userInfo.roles
    },
    // 私密信息（仅服务端可访问）
    secure: {
      token,
      permissions: userInfo.permissions
    },
    loggedInAt: new Date().toISOString()
  })
})
```

### 与 useApiFetch 配合使用

```vue
<script setup lang="ts">
const { loggedIn, user } = useApiAuth()

// 认证后的 API 请求会自动携带 token
const { data: profile } = await useApiFetch('/user/profile', {
  // token 自动从 session 获取并添加到请求头
})
</script>
```

### 保护页面

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useApiAuth()
</script>

<template>
  <div>
    <h1>欢迎，{{ user?.name }}</h1>
  </div>
</template>
```

## Session 结构

`useApiAuth` 使用以下 session 结构：

```ts
interface SessionData {
  // 公开用户信息（客户端可访问）
  user: {
    id: number
    name: string
    email: string
    // ... 其他用户信息
  }

  // 私密数据（仅服务端可访问）
  secure: {
    token: string
    // ... 其他敏感数据
  }

  // 登录时间
  loggedInAt: string
}
```

::note
`secure` 字段中的数据（包括 token）仅在服务端可访问，不会暴露给客户端，确保安全性。
::

## Caveats

### Token 存储安全

Token 存储在 session 的 `secure` 字段中，具有以下安全特性：

- **服务端存储** - Token 仅存在于服务端 session 中
- **不暴露客户端** - `secure` 字段的内容不会发送到客户端
- **自动注入** - API 请求时自动从 session 获取 token 并添加到请求头

### 认证配置继承

`useApiAuth` 会自动使用模块配置中的认证设置：

```ts
// nuxt.config.ts
movk: {
  api: {
    auth: {
      tokenType: 'Bearer',           // 或 'Basic', 'Custom'
      customTokenType: 'JWT',        // tokenType 为 'Custom' 时使用
      headerName: 'Authorization',   // 自定义 header 名称
      sessionTokenPath: 'secure.token'
    }
  }
}
```

调用 `login` 时，获取用户信息的请求会自动使用配置的认证格式：

```ts
// 如果配置 tokenType: 'Bearer', headerName: 'Authorization'
// 用户信息请求会自动携带：Authorization: Bearer <token>

// 如果配置 tokenType: 'Custom', customTokenType: 'JWT', headerName: 'X-Token'
// 用户信息请求会自动携带：X-Token: JWT <token>
```

### 多端点支持

```ts
const { login } = useApiAuth()

// 使用特定端点
await login({
  loginPath: '/auth/login',
  credentials: { username: 'admin', password: '123456' },
  endpoint: 'authServer' // 使用 authServer 端点的配置
})
```

### 错误处理

```ts
const { login } = useApiAuth()

try {
  await login({
    loginPath: '/auth/login',
    credentials: { username: 'admin', password: 'wrong' }
  })
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('token not found')) {
      // 登录成功但响应中没有 token
      console.error('登录响应格式错误')
    } else {
      // 其他错误（如网络错误、认证失败等）
      console.error('登录失败:', error.message)
    }
  }
}
```

## Changelog

:commit-changelog{prefix="/composables" suffix="ts"}
