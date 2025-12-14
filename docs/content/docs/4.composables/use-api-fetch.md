---
title: useApiFetch
description: 基于 Nuxt useFetch 封装的 API 请求组合式函数，提供自动认证、业务状态码检查和 Toast 提示。
---

## Usage

使用自动导入的 `useApiFetch` composable 进行 API 请求，基于 Nuxt `useFetch` 封装，提供企业级 API 请求能力。

```vue
<script setup lang="ts">
// 基础用法
const { data, pending, error } = await useApiFetch<User[]>('/users')

// POST 请求
const { data: user } = await useApiFetch<User>('/users', {
  method: 'POST',
  body: { name: 'test', email: 'test@example.com' }
})
</script>
```

- `useApiFetch` 自动使用模块配置的 API 端点和认证信息。
- 支持业务状态码检查，自动区分 HTTP 错误和业务错误。
- 内置 Toast 提示，可按需配置成功/错误提示。

::note
`useApiFetch` 会自动解包响应数据，直接返回 `data` 字段内容。如需获取完整响应，设置 `unwrap: false`。
::

## API

### useApiFetch()

`useApiFetch<T>(url: MaybeRefOrGetter<string>, options?: UseApiFetchOptions<T>): AsyncData<T | null, ApiError | null>`{lang="ts-type"}

基础 API 请求函数。

#### Parameters

::field-group
  ::field{name="url" type="MaybeRefOrGetter<string>"}
  请求路径，支持响应式值。
  ::

  ::field{name="options" type="UseApiFetchOptions<T>"}
  请求配置选项。

  ::collapsible
    ::field-group
      ::field{name="endpoint" type="string"}
      使用的 API 端点名称，默认使用 `defaultEndpoint`。
      ::

      ::field{name="auth" type="boolean"}
      是否携带认证信息。
      ::

      ::field{name="toast" type="RequestToastOptions | false"}
      Toast 提示配置，设为 `false` 禁用所有提示。
      ::

      ::field{name="unwrap" type="boolean"}
      是否解包数据，默认 `true`。
      ::

      ::field{name="transform" type="(response: ApiResponse<T>) => T"}
      自定义数据转换函数。
      ::

      ::field{name="skipBusinessCheck" type="boolean"}
      跳过业务状态码检查，默认 `false`。
      ::
    ::
  ::
  ::
::

#### Returns

返回 Nuxt `AsyncData` 类型，包含以下属性：

::field-group
  ::field{name="data" type="Ref<T | null>"}
  响应数据（已解包）。
  ::

  ::field{name="pending" type="Ref<boolean>"}
  请求是否进行中。
  ::

  ::field{name="error" type="Ref<ApiError | null>"}
  错误信息，包含 HTTP 错误和业务错误。
  ::

  ::field{name="status" type="Ref<AsyncDataRequestStatus>"}
  请求状态：`'idle'` | `'pending'` | `'success'` | `'error'`。
  ::

  ::field{name="execute" type="() => Promise<void>"}
  手动执行请求。
  ::

  ::field{name="refresh" type="() => Promise<void>"}
  刷新数据。
  ::
::

### useLazyApiFetch()

`useLazyApiFetch<T>(url: MaybeRefOrGetter<string>, options?: UseApiFetchOptions<T>): AsyncData<T | null, ApiError | null>`{lang="ts-type"}

Lazy 版本的 `useApiFetch`，设置 `lazy: true`，不阻塞页面渲染。

```ts
const { data, pending, execute } = useLazyApiFetch('/users')

// 数据在后台加载，页面立即渲染
// pending.value 为 true 时显示加载状态
```

### useClientApiFetch()

`useClientApiFetch<T>(url: MaybeRefOrGetter<string>, options?: UseApiFetchOptions<T>): AsyncData<T | null, ApiError | null>`{lang="ts-type"}

仅客户端执行的 `useApiFetch`，设置 `server: false, lazy: true, immediate: false`。适合非 SEO 敏感数据。

```ts
const { data, execute } = useClientApiFetch('/user/preferences')

// 在 onMounted 或用户操作时触发
onMounted(() => execute())
```

## 配置

### 模块配置

在 `nuxt.config.ts` 中配置 API 模块：

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    api: {
      enabled: true,
      defaultEndpoint: 'default',
      endpoints: {
        default: {
          baseURL: 'https://api.example.com'
        },
        v2: {
          baseURL: 'https://api.example.com/v2'
        }
      },
      // 全局认证配置
      auth: {
        enabled: true,
        tokenType: 'Bearer',
        headerName: 'Authorization',
        sessionTokenPath: 'secure.token',
        redirectOnUnauthorized: true,
        loginPath: '/login'
      },
      // 全局成功判断配置
      success: {
        successCodes: [200, 0],
        codeKey: 'code',
        messageKey: 'msg',
        dataKey: 'data'
      },
      // 全局 Toast 配置
      toast: {
        enabled: true,
        success: { show: true, color: 'success', duration: 3000 },
        error: { show: true, color: 'error', duration: 5000 }
      }
    }
  }
})
```

### Toast 配置

每个请求可单独配置 Toast 提示：

```ts
// 自定义成功消息
const { data } = await useApiFetch('/users', {
  method: 'POST',
  body: userData,
  toast: {
    successMessage: '用户创建成功！'
  }
})

// 自定义错误消息
const { data } = await useApiFetch('/users', {
  toast: {
    errorMessage: '获取用户列表失败，请稍后重试'
  }
})

// 禁用成功提示，保留错误提示
const { data } = await useApiFetch('/users', {
  toast: {
    success: false
  }
})

// 完全禁用 Toast
const { data } = await useApiFetch('/users', {
  toast: false
})
```

## Example

### 基础 CRUD 操作

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

// 获取列表
const { data: users, pending, refresh } = await useApiFetch<User[]>('/users')

// 创建用户
async function createUser(userData: Omit<User, 'id'>) {
  const { data, error } = await useApiFetch<User>('/users', {
    method: 'POST',
    body: userData,
    toast: { successMessage: '用户创建成功' }
  })

  if (!error.value) {
    await refresh() // 刷新列表
  }
}

// 更新用户
async function updateUser(id: number, userData: Partial<User>) {
  await useApiFetch(`/users/${id}`, {
    method: 'PUT',
    body: userData,
    toast: { successMessage: '用户更新成功' }
  })
}

// 删除用户
async function deleteUser(id: number) {
  await useApiFetch(`/users/${id}`, {
    method: 'DELETE',
    toast: { successMessage: '用户删除成功' }
  })
  await refresh()
}
</script>

<template>
  <div>
    <UTable v-if="users" :rows="users" :loading="pending" />
  </div>
</template>
```

### 切换 API 端点

```ts
// 使用默认端点
const { data: v1Users } = await useApiFetch('/users')

// 使用 v2 端点
const { data: v2Users } = await useApiFetch('/users', {
  endpoint: 'v2'
})
```

### 自定义数据转换

```ts
interface ApiUser {
  user_id: number
  user_name: string
  user_email: string
}

interface User {
  id: number
  name: string
  email: string
}

// 自定义转换函数
const { data } = await useApiFetch<User>('/users/1', {
  transform: (response) => {
    const apiUser = response.data as ApiUser
    return {
      id: apiUser.user_id,
      name: apiUser.user_name,
      email: apiUser.user_email
    }
  }
})
```

### 获取完整响应

```ts
import type { ApiResponse } from '@movk/nuxt'

interface User {
  id: number
  name: string
}

// 禁用自动解包
const { data } = await useApiFetch<ApiResponse<User>>('/users/1', {
  unwrap: false
})

// data.value 包含完整响应结构
// { code: 200, msg: 'success', data: { id: 1, name: 'test' } }
```

### 与 AutoForm 集成

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const formatter = useDateFormatter()

const schema = afz.object({
  name: afz.string('请输入姓名'),
  email: afz.email('请输入有效邮箱'),
  birthdate: afz.calendarDate('请选择出生日期')
})

type FormData = z.output<typeof schema>

const form = ref<Partial<FormData>>({})

async function onSubmit(event: FormSubmitEvent<FormData>) {
  // 转换日期字段为 ISO 格式
  const payload = formatter.convertToISO(event.data)

  await useApiFetch('/users', {
    method: 'POST',
    body: payload,
    toast: { successMessage: '提交成功' }
  })
}
</script>

<template>
  <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
</template>
```

## Caveats

### 业务状态码检查

`useApiFetch` 会自动检查业务状态码（默认检查 `code` 字段是否在 `successCodes` 中）：

```ts
// 响应示例
// { code: 200, msg: 'success', data: [...] } - 成功
// { code: 401, msg: '未授权' } - 业务错误

const { data, error } = await useApiFetch('/users')

if (error.value) {
  // error.value.isBusinessError 区分业务错误和 HTTP 错误
  if (error.value.isBusinessError) {
    console.log('业务错误:', error.value.message)
  } else {
    console.log('HTTP 错误:', error.value.statusCode)
  }
}
```

跳过业务状态码检查：

```ts
const { data } = await useApiFetch('/external-api', {
  skipBusinessCheck: true
})
```

### 认证处理

当配置了 `auth.enabled: true` 时，`useApiFetch` 会自动：

1. 从 session 获取 token（路径由 `sessionTokenPath` 配置）
2. 添加 Authorization header（格式由 `tokenType` 配置）
3. 401 响应时自动跳转登录页（由 `redirectOnUnauthorized` 配置）
4. 401 响应时清除 session（由 `clearSessionOnUnauthorized` 配置）

### SSR 注意事项

- `useApiFetch` 默认在服务端和客户端都执行
- 使用 `useLazyApiFetch` 避免阻塞页面渲染
- 使用 `useClientApiFetch` 仅在客户端执行（需要手动调用 `execute()`）

```ts
// SSR 友好 - 阻塞渲染直到数据加载完成
const { data } = await useApiFetch('/users')

// 非阻塞 - 页面立即渲染，数据后台加载
const { data, pending } = useLazyApiFetch('/users')

// 仅客户端 - 适合用户特定数据
const { data, execute } = useClientApiFetch('/user/preferences')
onMounted(() => execute())
```

### 类型推断

泛型参数 `T` 表示解包后的数据类型：

```ts
interface User {
  id: number
  name: string
}

// data 类型为 Ref<User | null>
const { data } = await useApiFetch<User>('/users/1')

// data 类型为 Ref<User[] | null>
const { data } = await useApiFetch<User[]>('/users')
```

## Changelog

:commit-changelog{prefix="/composables" suffix="ts"}
