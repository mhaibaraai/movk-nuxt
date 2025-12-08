---
title: useApiFetch
description: 自定义 API Fetch 组合式函数，集成认证、Toast 提示、多端点等功能。
---

## 概述

`useApiFetch` 是基于 Nuxt 的 `useFetch` 封装的增强版 API 请求函数，遵循 [Nuxt Custom useFetch Recipe](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)，提供以下功能：

- 🔐 **认证集成**：与 `nuxt-auth-utils` 无缝集成，自动携带 Token
- 🍞 **Toast 提示**：基于 `@nuxt/ui` 的 `useToast`，支持成功/错误自动提示
- 🌐 **多端点支持**：支持配置多个 API 端点（正式/测试/Mock 等）
- 📦 **数据解包**：自动解包 API 响应中的 `data` 字段
- ✅ **业务状态码**：自动检查业务状态码并抛出错误
- 🎯 **TypeScript**：完整的类型支持

::note
相比传统的 `useFetch`，`useApiFetch` 遵循 Nuxt 官方推荐的自定义 Fetch 模式，使用自定义 `$fetch` 实例，性能更优，功能更强大。
::

## 使用方法

使用自动导入的 `useApiFetch` composable 进行 API 请求。

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useApiFetch('/users')

// data 自动解包，直接获取业务数据
// pending 表示加载状态
// error 包含错误信息（HTTP 错误或业务错误）
// refresh 用于重新请求
</script>
```

::note
所有方法都内置了错误处理和 Toast 提示。当业务状态码表示失败时会自动抛出错误并显示 Toast 提示。
::

## 配置

在 `nuxt.config.ts` 中配置 API 模块：

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt', 'nuxt-auth-utils'],

  movk: {
    api: {
      // 是否启用 API 功能
      enabled: true,

      // 默认端点
      defaultEndpoint: 'default',

      // 端点配置
      endpoints: {
        default: {
          baseURL: '/api'
        },
        // 正式环境
        prod: {
          baseURL: 'https://api.example.com'
        },
        // 测试环境
        test: {
          baseURL: 'https://test-api.example.com'
        }
      },

      // 认证配置 (集成 nuxt-auth-utils)
      auth: {
        enabled: true,
        tokenSource: 'session',
        sessionTokenPath: 'secure.token',
        tokenType: 'Bearer',
        headerName: 'Authorization',
        redirectOnUnauthorized: true,
        loginPath: '/login',
        clearSessionOnUnauthorized: true
      },

      // Toast 提示配置
      toast: {
        enabled: true,
        success: {
          show: true,
          color: 'success',
          duration: 3000
        },
        error: {
          show: true,
          color: 'error',
          duration: 5000
        }
      },

      // 成功响应判断配置
      success: {
        successCodes: [200, 0],
        codeKey: 'code',
        messageKey: 'msg',
        dataKey: 'data'
      },

      // 调试模式
      debug: false
    }
  }
})
```

## API

### useApiFetch()

`useApiFetch<T>(url: MaybeRefOrGetter<string>, options?: UseApiFetchOptions<T>): AsyncData<T | null, FetchError | null>`{lang="ts-type"}

基于 `useFetch` 的增强版 API 请求函数。

#### Parameters

::field-group
  ::field{name="url" type="MaybeRefOrGetter<string>" required}
  请求 URL，支持响应式。

  ::collapsible
    ```ts
    // 静态 URL
    useApiFetch('/users')

    // 响应式 URL
    const userId = ref(1)
    useApiFetch(() => `/users/${userId.value}`)
    ```
  ::
  ::

  ::field{name="options" type="UseApiFetchOptions<T>"}
  请求配置选项。

  ::collapsible
    ::field-group
      ::field{name="endpoint" type="string"}
      使用的端点名称（默认为 `defaultEndpoint`）。
      ::

      ::field{name="api" type="ApiCoreOptions<T>"}
      API 特定配置。

      ::collapsible
        ::field-group
          ::field{name="auth" type="boolean"}
          是否携带认证 Token（默认 `true`）。
          ::

          ::field{name="toast" type="RequestToastConfig | false"}
          Toast 配置或禁用。
          ::

          ::field{name="unwrap" type="boolean"}
          是否自动解包数据（默认 `true`）。
          ::

          ::field{name="transform" type="(response: ApiResponseBase<T>) => T"}
          自定义数据转换函数。
          ::

          ::field{name="skipBusinessCheck" type="boolean"}
          跳过业务状态码检查（默认 `false`）。
          ::
        ::
      ::
      ::

      ::field{name="method" type="'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'"}
      HTTP 方法（默认 `'GET'`）。
      ::

      ::field{name="body" type="unknown"}
      请求体（POST、PUT、PATCH 请求）。
      ::

      ::field{name="query" type="Record<string, unknown>"}
      URL 查询参数。
      ::

      ::field{name="headers" type="Record<string, string> | Headers"}
      自定义请求头。
      ::

      ::field{name="lazy" type="boolean"}
      是否为懒加载模式（默认 `false`）。
      ::

      ::field{name="server" type="boolean"}
      是否在服务端执行（默认 `true`）。
      ::

      ::field{name="watch" type="WatchSource[]"}
      监听的响应式依赖。
      ::
    ::
  ::
  ::
::

#### Returns

返回 `AsyncData` 对象，包含以下属性：

::field-group
  ::field{name="data" type="Ref<T | null>"}
  响应数据（已自动解包）。
  ::

  ::field{name="pending" type="Ref<boolean>"}
  加载状态。
  ::

  ::field{name="error" type="Ref<FetchError | null>"}
  错误对象（HTTP 错误或业务错误）。
  ::

  ::field{name="refresh" type="() => Promise<void>"}
  重新请求函数。
  ::

  ::field{name="execute" type="() => Promise<void>"}
  手动触发请求（lazy 模式）。
  ::

  ::field{name="status" type="Ref<'idle' | 'pending' | 'success' | 'error'>"}
  请求状态。
  ::
::

### useLazyApiFetch()

`useLazyApiFetch<T>(url: MaybeRefOrGetter<string>, options?: UseApiFetchOptions<T>): AsyncData<T | null, FetchError | null>`{lang="ts-type"}

Lazy 版本的 `useApiFetch`，不会在服务端渲染时执行。

::collapsible
  ```ts
  const { data, pending, execute } = useLazyApiFetch('/users')

  // 手动触发请求
  await execute()
  ```
::

### $api 插件

通过 `useNuxtApp().$api` 访问原始 API 实例。

::field-group
  ::field{name="$fetch" type="$Fetch"}
  原始 `$fetch` 实例，可用于直接发送请求。

  ::collapsible
    ```ts
    const { $api } = useNuxtApp()

    // 直接使用 $fetch
    const data = await $api.$fetch('/users', {
      method: 'POST',
      body: { name: 'test' }
    })
    ```
  ::
  ::

  ::field{name="use()" type="(endpoint: string) => ApiInstance"}
  切换到指定端点。

  ::collapsible
    ```ts
    const { $api } = useNuxtApp()

    // 使用不同端点
    const prodApi = $api.use('prod')
    const data = await prodApi.$fetch('/users')
    ```
  ::
  ::

  ::field{name="download()" type="(url: string, filename?: string, options?: RequestOptions) => Promise<void>"}
  下载文件。

  ::collapsible
    ```ts
    const { $api } = useNuxtApp()

    await $api.download('/files/report.pdf', 'my-report.pdf')
    ```
  ::
  ::

  ::field{name="upload()" type="<T>(url: string, file: File | FormData, options?: UploadRequestOptions<T>) => Promise<ApiResponseBase<T>>"}
  上传文件。

  ::collapsible
    ```ts
    const { $api } = useNuxtApp()

    const file = fileInput.files[0]
    await $api.upload('/upload', file, {
      fieldName: 'file',
      onProgress: (progress) => {
        console.log(`上传进度: ${progress}%`)
      }
    })
    ```
  ::
  ::

  ::field{name="getConfig()" type="() => ApiEndpointConfig"}
  获取当前端点配置。
  ::
::

## 基础用法

### GET 请求

```vue
<script setup lang="ts">
// 基础 GET 请求
const { data, pending, error } = await useApiFetch('/users')

// 带查询参数
const { data: user } = await useApiFetch('/users/1', {
  query: {
    include: 'profile'
  }
})
</script>
```

### POST 请求

```vue
<script setup lang="ts">
const { data: newUser } = await useApiFetch('/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})
</script>
```

### PUT/PATCH 请求

```vue
<script setup lang="ts">
// 完整更新
await useApiFetch('/users/1', {
  method: 'PUT',
  body: { name: 'Updated Name' }
})

// 部分更新
await useApiFetch('/users/1', {
  method: 'PATCH',
  body: { email: 'newemail@example.com' }
})
</script>
```

### DELETE 请求

```vue
<script setup lang="ts">
await useApiFetch('/users/1', {
  method: 'DELETE'
})
</script>
```

## 高级用法

### 使用不同端点

```ts
// 方式 1: 通过 endpoint 参数
const { data } = await useApiFetch('/users', {
  endpoint: 'prod'
})

// 方式 2: 使用 $api.use()
const { $api } = useNuxtApp()
const prodApi = $api.use('prod')
const data = await prodApi.$fetch('/users')
```

### 自定义 Toast 提示

```ts
// 自定义成功消息
const { data } = await useApiFetch('/users', {
  method: 'POST',
  body: userData,
  api: {
    toast: {
      successMessage: '用户创建成功！',
      errorMessage: '创建失败，请重试'
    }
  }
})

// 禁用所有 Toast
const { data } = await useApiFetch('/users', {
  api: {
    toast: false
  }
})

// 只显示错误提示
const { data } = await useApiFetch('/users', {
  api: {
    toast: {
      success: false // 只禁用成功提示
    }
  }
})

// 自定义 Toast 样式
const { data } = await useApiFetch('/users', {
  api: {
    toast: {
      success: {
        color: 'primary',
        duration: 5000,
        icon: 'i-heroicons-check-circle'
      }
    }
  }
})
```

### 禁用认证

```ts
// 单次请求禁用认证
const { data } = await useApiFetch('/public/data', {
  api: {
    auth: false
  }
})
```

### 自定义数据转换

```ts
// 不自动解包
const { data } = await useApiFetch('/users', {
  api: {
    unwrap: false
  }
})
// data 为完整的 API 响应：{ code: 200, msg: '成功', data: [...] }

// 自定义转换逻辑
const { data } = await useApiFetch('/users', {
  api: {
    transform: (response) => {
      return response.data.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`
      }))
    }
  }
})
```

### 跳过业务状态码检查

```ts
// 跳过业务检查，即使 code 不是成功码也不抛出错误
const { data } = await useApiFetch('/users', {
  api: {
    skipBusinessCheck: true
  }
})
```

### 响应式 URL

```vue
<script setup lang="ts">
const userId = ref(1)

// URL 会自动响应 userId 的变化
const { data: user } = await useApiFetch(() => `/users/${userId.value}`)

// 切换用户
userId.value = 2 // 自动重新请求
</script>
```

### Lazy 模式

```vue
<script setup lang="ts">
// 不会在服务端执行，适合用户交互触发
const { data, pending, execute } = useLazyApiFetch('/users')

// 手动触发
async function loadUsers() {
  await execute()
}
</script>
```

### 文件下载

```ts
const { $api } = useNuxtApp()

// 下载文件
await $api.download('/files/report.pdf', 'my-report.pdf')

// 从不同端点下载
await $api.use('prod').download('/exports/data.xlsx')
```

### 文件上传

```ts
const { $api } = useNuxtApp()

// 上传单个文件
const file = fileInput.files[0]
const result = await $api.upload('/upload', file, {
  fieldName: 'file',
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
  }
})

// 上传 FormData（多文件）
const formData = new FormData()
formData.append('file1', file1)
formData.append('file2', file2)
formData.append('description', 'My files')

const result = await $api.upload('/upload', formData)
```

### 类型安全

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

// 方式 1: 直接指定类型
const { data } = await useApiFetch<User[]>('/users')
// data 类型为 Ref<User[] | null>

// 方式 2: 覆盖类型
const { data: users } = await fetchUser<User[]>('/users')
// users 类型为 Ref<User[] | null>
</script>
```

## 与 nuxt-auth-utils 集成

### 配置 Session Token

```ts
// server/routes/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 验证用户...
  const token = generateToken(user)

  // 存储到 session
  await setUserSession(event, {
    user: { id: user.id, name: user.name },
    secure: {
      token: token, // API Token 存储在 secure 中
      refreshToken: refreshToken
    }
  })

  return { success: true }
})
```

### 扩展 Session 类型

```ts
// types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: number
    name: string
    email: string
  }

  interface SecureSessionData {
    token: string
    refreshToken?: string
    tokenExpiresAt?: number
  }
}

export {}
```

## 响应格式支持

支持多种后端响应格式：

### 格式 1: 标准格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { "id": 1, "name": "John" }
}
```

### 格式 2: 简化格式

```json
{
  "code": 0,
  "message": "ok",
  "data": [{ "id": 1 }, { "id": 2 }],
  "error": null
}
```

### 格式 3: Token 响应

```json
{
  "code": 200,
  "msg": "登录成功",
  "token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

根据不同格式配置 `success` 选项：

```ts
// nuxt.config.ts
movk: {
  api: {
    success: {
      successCodes: [200, 0], // 同时支持 200 和 0
      codeKey: 'code',
      messageKey: 'msg', // 或 'message'
      dataKey: 'data'
    }
  }
}
```

## Example

以下是一个完整的用户管理示例：

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

// 列表查询
const { data: users, pending, refresh } = await useApiFetch<User[]>('/users')

// 创建用户
const createUser = async (userData: Partial<User>) => {
  await useApiFetch('/users', {
    method: 'POST',
    body: userData,
    api: {
      toast: {
        successMessage: '用户创建成功！'
      }
    }
  })

  // 刷新列表
  await refresh()
}

// 更新用户
const updateUser = async (id: number, updates: Partial<User>) => {
  await useApiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: updates,
    api: {
      toast: {
        successMessage: '用户更新成功！'
      }
    }
  })

  await refresh()
}

// 删除用户
const deleteUser = async (id: number) => {
  await useApiFetch(`/users/${id}`, {
    method: 'DELETE',
    api: {
      toast: {
        successMessage: '用户删除成功！'
      }
    }
  })

  await refresh()
}

// 文件导出
const { $api } = useNuxtApp()
const exportUsers = async () => {
  await $api.download('/users/export', 'users.xlsx')
}
</script>

<template>
  <div>
    <button @click="exportUsers">
      导出用户
    </button>

    <div v-if="pending">
      加载中...
    </div>

    <div v-else-if="users">
      <div v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}

        <button @click="updateUser(user.id, { name: 'New Name' })">
          编辑
        </button>

        <button @click="deleteUser(user.id)">
          删除
        </button>
      </div>
    </div>
  </div>
</template>
```

## Caveats

### 业务状态码 vs HTTP 状态码

`useApiFetch` 区分两种错误：

1. **HTTP 错误**（网络错误、服务器错误等）：由 `useFetch` 自动捕获，存储在 `error` 中
2. **业务错误**（业务逻辑失败）：通过 `success.successCodes` 判断，自动抛出错误

```ts
// 业务失败响应示例（HTTP 200，但业务失败）
// { code: 400, msg: '参数错误' }

const { error } = await useApiFetch('/users')

if (error.value) {
  // 可能是 HTTP 错误或业务错误
  console.log(error.value.statusCode) // 400
  console.log(error.value.message) // '参数错误'
}
```

如果不希望业务错误抛出异常，使用 `skipBusinessCheck: true`：

```ts
const { data } = await useApiFetch('/users', {
  api: {
    skipBusinessCheck: true,
    unwrap: false // 获取完整响应以手动检查
  }
})

// 手动检查业务状态
if (data.value?.code !== 200) {
  console.error(data.value?.msg)
}
```

### Toast 优先级

Toast 配置的优先级（从高到低）：

1. **请求级别配置**：`api.toast`
2. **端点配置**：`endpoints[name].toast`
3. **全局配置**：`movk.api.toast`

```ts
// 全局配置
movk: {
  api: {
    toast: { enabled: true, success: { show: true } }
  }
}

// 端点配置会覆盖全局
endpoints: {
  silent: {
    baseURL: '/api',
    toast: { success: { show: false } } // 此端点不显示成功提示
  }
}

// 请求配置优先级最高
useApiFetch('/users', {
  endpoint: 'silent',
  api: {
    toast: { successMessage: '强制显示' } // 覆盖端点配置
  }
})
```

### 数据解包规则

默认情况下 `unwrap: true`，会自动提取响应中的数据字段：

```ts
// API 响应
{
  code: 200,
  msg: '成功',
  data: [{ id: 1 }]
}

// useApiFetch 返回的 data.value
[{ id: 1 }] // 自动解包
```

解包按以下优先级查找字段：
1. `successConfig.dataKey`（默认 `'data'`）
2. `result` 字段
3. 原始响应

如果响应没有 `data` 字段，会返回原始响应：

```ts
// API 响应
{
  code: 200,
  msg: '成功',
  token: 'xxx'
}

// useApiFetch 返回的 data.value
{ code: 200, msg: '成功', token: 'xxx' } // 无 data 字段，返回原始响应
```

### 认证 Token 获取

当 `auth.enabled: true` 时，Token 获取流程：

1. 从 `sessionTokenPath` 获取（默认 `'secure.token'`）
2. 回退到 `'token'`
3. 回退到 `'secure.token'`

确保在登录后正确存储 Token：

```ts
// ✅ 正确：存储在 secure.token
await setUserSession(event, {
  user: { id: 1 },
  secure: { token: 'xxx' }
})

// ⚠️ 警告：存储在顶层（可用但不推荐）
await setUserSession(event, {
  user: { id: 1 },
  token: 'xxx' // 会被识别，但不安全
})
```

### 类型安全注意事项

使用 TypeScript 时，确保响应类型与实际数据匹配：

```ts
interface User {
  id: number
  name: string
}

// ✅ 正确：data 类型为 User[]
const { data } = await useApiFetch<User[]>('/users')

// ⚠️ 警告：如果 unwrap: false，需要包装类型
const { data } = await useApiFetch<ApiResponseBase<User[]>>('/users', {
  api: { unwrap: false }
})
// data 类型为 { code: number, msg: string, data: User[] }

// ✅ 推荐：使用自定义 transform
const { data } = await useApiFetch<User>('/user/1', {
  api: {
    transform: (response) => {
      const user = response.data
      // 在这里进行类型转换或数据处理
      return {
        ...user,
        // 添加计算属性
        displayName: `${user.firstName} ${user.lastName}`
      }
    }
  }
})
```

### 性能优化

对于列表页面，推荐使用 `lazy: true` 或 `useLazyApiFetch` 避免阻塞渲染：

```vue
<script setup lang="ts">
// ❌ 不推荐：阻塞页面渲染
const { data: users } = await useApiFetch('/users')

// ✅ 推荐：不阻塞渲染
const { data: users, pending } = useLazyApiFetch('/users')
</script>

<template>
  <div v-if="pending">加载中...</div>
  <div v-else>{{ users }}</div>
</template>
```

对于详情页面，使用 `server: false` 避免服务端重复请求：

```vue
<script setup lang="ts">
const route = useRoute()

// 只在客户端请求
const { data: user } = await useApiFetch(`/users/${route.params.id}`, {
  server: false
})
</script>
```

## Changelog

:commit-changelog{prefix="/composables" suffix="ts"}
