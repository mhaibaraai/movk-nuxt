<script setup lang="ts">
import type { ApiError, UseApiFetchOptions } from '@movk/nuxt'
import type { FetchError } from 'ofetch'

type AnyError = FetchError | ApiError

function build(url: string, opts: UseApiFetchOptions = {}) {
  return useApiFetch(url, { immediate: false, toast: false, ...opts })
}

const business = build('/demo/errors?type=business')
const http400 = build('/profile?fail=1')
const http422 = build('/demo/errors?type=422')
const http500 = build('/demo/errors?type=500')
const network = build('/demo/errors?type=network')

function classify(err: AnyError | null | undefined) {
  if (!err) return null

  const apiErr = err as Partial<ApiError>
  const isBusiness = apiErr.isBusinessError === true

  return {
    kind: isBusiness ? 'ApiError（业务错误）' : 'FetchError（HTTP 或网络）',
    name: err.name,
    statusCode: apiErr.statusCode ?? (err as FetchError).statusCode,
    message: err.message,
    isBusinessError: apiErr.isBusinessError ?? false,
    response: apiErr.response ?? null
  }
}

const cases = [
  {
    name: '业务错误',
    desc: 'HTTP 200 但 code !== successCodes：抛 ApiError，isBusinessError=true',
    state: business
  },
  {
    name: 'HTTP 400',
    desc: '后端 createError({ statusCode: 400 })：FetchError，statusCode=400',
    state: http400
  },
  {
    name: 'HTTP 422 校验',
    desc: '后端 createError({ statusCode: 422, data: { fields } })：FetchError 携带 data',
    state: http422
  },
  {
    name: 'HTTP 500',
    desc: '后端抛 500：FetchError，statusCode=500',
    state: http500
  },
  {
    name: '网络中断',
    desc: '服务端 destroy 连接，客户端 fetch 失败：FetchError 无 statusCode',
    state: network
  }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <p class="text-sm text-muted">
      模块只产出 ApiError（业务错误）一种自定义错误，其余均为 ofetch 原生 FetchError；通过 isBusinessError 与 statusCode 区分场景
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        v-for="c in cases"
        :key="c.name"
        :title="c.name"
        :description="c.desc"
        :state="classify(c.state.error.value)"
      >
        <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="c.state.execute()">
          触发请求
        </UButton>
      </Showcase>
    </div>
  </div>
</template>
