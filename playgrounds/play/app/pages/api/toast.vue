<script setup lang="ts">
import type { UseApiFetchOptions } from '@movk/nuxt'

const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

function build(opts: UseApiFetchOptions) {
  return useApiFetch(target, { immediate: false, ...opts })
}

// 1. 默认：success/error 都按全局配置弹出
const def = build({})

// 2. toast: false 完全静音（成功失败都不弹）
const silent = build({ toast: false })

// 3. 覆盖文案：successMessage / errorMessage 替换默认文案
const overrideMessage = build({
  toast: { successMessage: '加载成功 ✓', errorMessage: '加载失败 ✗' }
})

// 4. 仅关闭成功 toast：保留 error 提示
const errorOnly = build({ toast: { success: false } })

// 5. 自定义 ToastProps：覆盖 color/icon
const customStyle = build({
  toast: {
    success: { color: 'secondary', icon: 'i-lucide-sparkles' },
    error: { color: 'warning', icon: 'i-lucide-triangle-alert' }
  }
})

const cases = [
  { name: '默认', state: def, desc: '继承全局 toast 配置，成功/错误均按默认样式弹出' },
  { name: '完全静音', state: silent, desc: 'toast: false 关闭所有单次提示' },
  { name: '覆盖文案', state: overrideMessage, desc: 'successMessage / errorMessage 替换默认文案' },
  { name: '仅静默成功', state: errorOnly, desc: '{ success: false } 关闭成功提示但保留错误提示' },
  { name: '自定义样式', state: customStyle, desc: '成功 / 错误分别覆盖 color、icon 等 ToastProps' }
]

function triggerAll() {
  cases.forEach(c => c.state.execute())
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误（验证错误分支）" />
      <UButton size="sm" icon="i-lucide-zap" @click="triggerAll">
        触发全部
      </UButton>
      <span class="text-sm text-muted">每个 Showcase 也可单独触发</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        v-for="c in cases"
        :key="c.name"
        :title="c.name"
        :description="c.desc"
        :state="c.state.error.value ? { error: c.state.error.value.message } : c.state.data.value"
      >
        <UButton size="sm" variant="outline" icon="i-lucide-send" @click="c.state.execute()">
          触发请求
        </UButton>
      </Showcase>
    </div>
  </div>
</template>
