---
title: useApiFetch
description: 自定义 API Fetch 组合式函数，集成认证、Toast 提示、多端点等功能。
---

## 概述

`useApiFetch` 是基于 Nuxt 的 `useFetch` 封装的增强版 API 请求函数，提供以下功能：

- 🔐 **认证集成**：与 `nuxt-auth-utils` 无缝集成，自动携带 Token
- 🍞 **Toast 提示**：基于 `@nuxt/ui` 的 `useToast`，支持成功/错误自动提示
- 🌐 **多端点支持**：支持配置多个 API 端点（正式/测试/Mock 等）
- 📦 **数据解包**：自动解包 API 响应中的 `data` 字段
- 🎯 **TypeScript**：完整的类型支持

## 配置

在 `nuxt.config.ts` 中配置 API 模块：

```ts
export default defineNuxtConfig({
  modules: ['movk-nuxt', 'nuxt-auth-utils'],

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
        },
        // Mock 数据
        mock: {
          baseURL: 'https://mock.example.com'
        }
      },

      // 认证配置 (集成 nuxt-auth-utils)
      auth: {
        enabled: true,
        // Token 来源: 'session' 从 nuxt-auth-utils 获取
        tokenSource: 'session',
        // Session 中 token 的路径
        sessionTokenPath: 'secure.token',
        // Token 类型
        tokenType: 'Bearer',
        // Header 名称
        headerName: 'Authorization',
        // 401 时自动跳转登录页
        redirectOnUnauthorized: true,
        loginPath: '/login',
        // 401 时清除 session
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
        // 成功状态码
        successCodes: [200, 0],
        // 状态码字段
        codeKey: 'code',
        // 消息字段
        messageKey: 'msg',
        // 数据字段
        dataKey: 'data'
      },

      // 调试模式
      debug: false
    }
  }
})
```

## 基础用法

### 使用 useApiFetch

```vue
<script setup lang="ts">
// 基础 GET 请求
const { data, pending, error } = await useApiFetch('/users')

// POST 请求
const { data: newUser } = await useApiFetch('/users', {
  method: 'POST',
  body: { name: 'John' }
})
</script>
```

### 使用 $api 插件

```vue
<script setup lang="ts">
const { $api } = useNuxtApp()

// GET 请求
const users = await $api.get<User[]>('/users')

// POST 请求
const newUser = await $api.post<User>('/users', { name: 'John' })

// PUT 请求
await $api.put('/users/1', { name: 'Updated' })

// DELETE 请求
await $api.delete('/users/1')
</script>
```

## 高级用法

### 使用不同端点

```ts
// 使用 useApiFetch
const { data } = await useApiFetch('/users', {
  endpoint: 'prod'
})

// 使用 $api
const { $api } = useNuxtApp()
const users = await $api.use('mock').get('/users')
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

// 禁用 Toast
const { data } = await useApiFetch('/users', {
  api: {
    toast: false
  }
})

// 只禁用成功提示
const { data } = await useApiFetch('/users', {
  api: {
    toast: {
      success: false
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

// 使用 $api
const data = await $api.get('/public/data', { auth: false })
```

### 自定义数据转换

```ts
const { data } = await useApiFetch('/users', {
  api: {
    unwrap: false, // 不自动解包
    transform: (response) => {
      // 自定义转换逻辑
      return response.data.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`
      }))
    }
  }
})
```

### 文件下载

```ts
const { $api } = useNuxtApp()

// 下载文件
await $api.download('/files/report.pdf', {}, 'my-report.pdf')
```

### 文件上传

```ts
const { $api } = useNuxtApp()

// 上传单个文件
const file = fileInput.files[0]
const result = await $api.upload('/upload', file, {
  fieldName: 'file', // 字段名
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
  }
})

// 上传 FormData
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'document')
const result = await $api.upload('/upload', formData)
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

## 类型定义

```ts
interface UseApiFetchOptions<T> {
  // 使用的端点名称
  endpoint?: string
  // API 配置
  api?: {
    // 是否携带认证
    auth?: boolean
    // Toast 配置
    toast?: RequestToastOptions | false
    // 是否解包数据
    unwrap?: boolean
    // 自定义转换函数
    transform?: (response: ApiResponseBase<T>) => T
    // 超时时间
    timeout?: number
    // 重试次数
    retry?: number | false
  }
  // 其他 useFetch 选项...
}
```

## API 参考

### useApiFetch

```ts
function useApiFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: UseApiFetchOptions<T>
): UseApiFetchReturn<T>
```

### useLazyApiFetch

不在服务端执行的懒加载版本：

```ts
function useLazyApiFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: UseApiFetchOptions<T>
): UseApiFetchReturn<T>
```

### $api

通过 `useNuxtApp().$api` 访问：

```ts
interface ApiInstance {
  get<T>(url: string, options?: RequestOptions): Promise<T>
  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>
  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>
  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>
  delete<T>(url: string, options?: RequestOptions): Promise<T>
  download(url: string, options?: RequestOptions, filename?: string): Promise<void>
  upload<T>(url: string, file: File | FormData, options?: UploadOptions): Promise<ApiResponseBase<T>>
  use(endpoint: string): ApiInstance
  getConfig(): ApiEndpointConfig
  raw: $Fetch
}
```
