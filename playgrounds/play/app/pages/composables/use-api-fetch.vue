<script setup lang="ts">
const url = ref('/api/profile')
const fail = ref(false)

const ssr = useApiFetch(() => `${url.value}${fail.value ? '?fail=1' : ''}`)
const lazy = useLazyApiFetch(() => `${url.value}${fail.value ? '?fail=1' : ''}`)
const csr = useClientApiFetch(() => `${url.value}${fail.value ? '?fail=1' : ''}`)

function refreshAll() {
  ssr.refresh()
  lazy.refresh()
  csr.refresh()
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center gap-2 flex-wrap">
      <UInput v-model="url" size="sm" class="flex-1 min-w-[260px]" />
      <USwitch v-model="fail" label="注入 400 错误" />
      <UButton size="sm" icon="i-lucide-refresh-cw" @click="refreshAll">
        刷新全部
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Showcase
        title="useApiFetch"
        description="SSR 立即获取，刷新页面后页面渲染时已含数据"
      >
        <UBadge :color="ssr.pending.value ? 'warning' : (ssr.error.value ? 'error' : 'success')" variant="subtle">
          {{ ssr.pending.value ? 'pending' : (ssr.error.value ? 'error' : 'ready') }}
        </UBadge>
        <StateViewer :state="ssr.error.value ? { error: ssr.error.value.message } : ssr.data.value" />
      </Showcase>

      <Showcase
        title="useLazyApiFetch"
        description="懒加载：不阻塞渲染，pending 时返回空数据"
      >
        <UBadge :color="lazy.pending.value ? 'warning' : (lazy.error.value ? 'error' : 'success')" variant="subtle">
          {{ lazy.pending.value ? 'pending' : (lazy.error.value ? 'error' : 'ready') }}
        </UBadge>
        <StateViewer :state="lazy.error.value ? { error: lazy.error.value.message } : lazy.data.value" />
      </Showcase>

      <Showcase
        title="useClientApiFetch"
        description="仅客户端：SSR 期间不发起请求，挂载后再请求"
      >
        <UBadge :color="csr.pending.value ? 'warning' : (csr.error.value ? 'error' : 'success')" variant="subtle">
          {{ csr.pending.value ? 'pending' : (csr.error.value ? 'error' : 'ready') }}
        </UBadge>
        <StateViewer :state="csr.error.value ? { error: csr.error.value.message } : csr.data.value" />
      </Showcase>
    </div>
  </div>
</template>
