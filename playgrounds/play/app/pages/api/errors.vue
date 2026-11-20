<script setup lang="ts">
import type { ApiError, UseApiFetchOptions } from '@movk/nuxt'

function build(url: string, opts: UseApiFetchOptions = {}) {
  return useApiFetch(url, { immediate: false, toast: false, ...opts })
}

const business = build('/demo/errors?type=business')
const http400 = build('/profile?fail=1')
const http422 = build('/demo/errors?type=422')
const http500 = build('/demo/errors?type=500', { retry: 0 })
const network = build('/demo/errors?type=network', { retry: 0 })
const timeout = build('/demo/errors?type=slow', { timeout: 500 })

function describeError(err: ApiError | null | undefined) {
  if (!err) return null

  return {
    kind: err.data?.kind,
    statusCode: err.statusCode,
    message: err.message,
    code: err.data?.code,
    endpoint: err.data?.endpoint,
    response: err.data?.response ?? null
  }
}

const cases = [
  {
    name: '业务错误',
    desc: 'HTTP 200 但 code 不在 successCodes 内 → kind 为 business，data.code 保留原始业务码。',
    state: business
  },
  {
    name: 'HTTP 400',
    desc: '后端 createError 返回 400 → kind 为 http，statusCode 为 400。',
    state: http400
  },
  {
    name: 'HTTP 422 校验',
    desc: '后端 createError 携带 data → kind 为 http，data.response 保留服务端补充信息。',
    state: http422
  },
  {
    name: 'HTTP 500',
    desc: '后端抛 500 → kind 为 http；默认 GET 会重试一次，错误只上报一次。',
    state: http500
  },
  {
    name: '网络中断',
    desc: '服务端销毁连接、请求拿不到响应 → kind 为 network。',
    state: network
  },
  {
    name: '请求超时',
    desc: '通过 timeout 设置 500ms，服务端延迟 2s → kind 为 timeout。',
    state: timeout
  }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <p class="text-sm text-muted">
      所有失败统一为 ApiError（NuxtError），按 error.data.kind 区分 business、http、network、timeout 场景。
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        v-for="c in cases"
        :key="c.name"
        :title="c.name"
        :description="c.desc"
        :state="describeError(c.state.error.value)"
      >
        <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="c.state.execute()">
          触发请求
        </UButton>
      </Showcase>
    </div>
  </div>
</template>
