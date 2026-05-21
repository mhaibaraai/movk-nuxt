<script setup lang="ts">
const url = ref('/profile')
const fail = ref(false)

const composedUrl = () => `${url.value}${fail.value ? '?fail=1' : ''}`

const ssr = useApiFetch(composedUrl)
const lazy = useLazyApiFetch(composedUrl)
const csr = useClientApiFetch(composedUrl)

function refreshAll() {
  ssr.refresh()
  lazy.refresh()
  csr.refresh()
}

function statusOf(state: { pending: { value: boolean }, error: { value: unknown } }) {
  if (state.pending.value) return { color: 'warning' as const, text: 'pending' }
  if (state.error.value) return { color: 'error' as const, text: 'error' }
  return { color: 'success' as const, text: 'ready' }
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center gap-2 flex-wrap">
      <UInput v-model="url" size="sm" class="flex-1 min-w-65" />
      <USwitch v-model="fail" label="注入 400 错误" />
      <UButton size="sm" icon="i-lucide-refresh-cw" @click="refreshAll">
        刷新全部
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Showcase
        title="SSR 同步请求"
        description="useApiFetch 在 SSR 阶段发起请求，首屏即可拿到接口数据或错误"
      >
        <UBadge :color="statusOf(ssr).color" variant="subtle">
          {{ statusOf(ssr).text }}
        </UBadge>
        <StateViewer :state="ssr.error.value ? { error: ssr.error.value.message } : ssr.data.value" />
      </Showcase>

      <Showcase
        title="延迟请求"
        description="useLazyApiFetch 先完成页面渲染再进入 pending，期间数据为空"
      >
        <UBadge :color="statusOf(lazy).color" variant="subtle">
          {{ statusOf(lazy).text }}
        </UBadge>
        <StateViewer :state="lazy.error.value ? { error: lazy.error.value.message } : lazy.data.value" />
      </Showcase>

      <Showcase
        title="客户端请求"
        description="useClientApiFetch 跳过 SSR，浏览器挂载后请求，状态从 pending 切到 ready 或 error"
      >
        <UBadge :color="statusOf(csr).color" variant="subtle">
          {{ statusOf(csr).text }}
        </UBadge>
        <StateViewer :state="csr.error.value ? { error: csr.error.value.message } : csr.data.value" />
      </Showcase>
    </div>
  </div>
</template>
