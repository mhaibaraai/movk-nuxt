<script setup lang="ts">
const { $api } = useNuxtApp()
const publicConfig = useRuntimeConfig().public.movkApi

// useFetch('')

const defaultRes = useApiFetch('/profile')
const v2Res = useApiFetch('/profile', { endpoint: 'v2' })

const imperativeData = ref<unknown>(null)
const imperativePending = ref(false)
const imperativeError = ref<string | null>(null)

async function callImperativeV2() {
  imperativePending.value = true
  imperativeError.value = null
  try {
    imperativeData.value = await $api.use('v2')('/profile')
  }
  catch (err) {
    imperativeError.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    imperativePending.value = false
  }
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase
      title="默认端点"
      description="useApiFetch 未传 endpoint 时走 default 端点 baseURL: /api"
      :state="defaultRes.data.value"
    >
      <UBadge variant="subtle">
        baseURL: {{ publicConfig.endpoints?.default?.baseURL }}
      </UBadge>
      <UButton size="sm" variant="outline" @click="defaultRes.refresh()">
        刷新
      </UButton>
    </Showcase>

    <Showcase
      title="切换至 v2 端点"
      description="endpoint 选项指定别名，请求自动改用对应 baseURL"
      :state="v2Res.data.value"
    >
      <UBadge color="secondary" variant="subtle">
        baseURL: {{ publicConfig.endpoints?.v2?.baseURL }}
      </UBadge>
      <UButton size="sm" variant="outline" @click="v2Res.refresh()">
        刷新
      </UButton>
    </Showcase>

    <Showcase
      title="命令式调用 $api.use()"
      description="脱离 useFetch 上下文，直接通过 $api.use(name) 取得端点实例并发起裸请求"
      :state="imperativeError ? { error: imperativeError } : imperativeData"
    >
      <UButton
        size="sm"
        :loading="imperativePending"
        icon="i-lucide-zap"
        @click="callImperativeV2"
      >
        $api.use('v2')('/profile')
      </UButton>
    </Showcase>

    <Showcase
      title="当前生效配置"
      description="runtimeConfig.public.movkApi 中的端点列表与默认端点名"
      :state="{
        defaultEndpoint: publicConfig.defaultEndpoint,
        endpoints: publicConfig.endpoints
      }"
    >
      <p class="text-sm text-muted">
        在 nuxt.config 的 movk.api.endpoints 注册新别名后即可被 endpoint 选项引用
      </p>
    </Showcase>
  </div>
</template>
