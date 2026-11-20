<script setup lang="ts">
// 1. 默认解包：业务数据从 envelope.data 字段抽出
const unwrapped = useApiFetch('/profile')

// 2. unwrap: false：拿到完整 envelope（code/message/data）
const raw = useApiFetch('/profile', { unwrap: false })

// 3. businessCheck: false：legacy 接口缺 code 字段，关闭校验后仍按 dataKey 解包
const legacy = useApiFetch('/demo/legacy', { businessCheck: false })

// 4. 组合：external 接口非标 envelope，两者同关 → 原样返回
const external = useApiFetch('/demo/external', { businessCheck: false, unwrap: false })

// 5. 端点级声明：raw 端点配置 response: { businessCheck: false, unwrap: false }
const endpointRaw = useApiFetch('/points', { endpoint: 'raw' })

// 6. 请求级覆盖端点：对 raw 端点重新开启业务校验，裸数组无 code → 抛 business ApiError
const override = useApiFetch('/points', { endpoint: 'raw', businessCheck: true, immediate: false, toast: false })
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase
      title="默认解包"
      description="按 response.dataKey 默认 data 字段抽取业务数据，调用方直接拿到去信封后的对象。"
      :state="unwrapped.data.value"
    >
      <UBadge variant="subtle">
        useApiFetch('/profile')
      </UBadge>
    </Showcase>

    <Showcase
      title="保留原始信封"
      description="通过 unwrap 关闭解包 → 不重写 response._data，拿到 code、message、data 完整结构。"
      :state="raw.data.value"
    >
      <UBadge color="info" variant="subtle">
        { unwrap: false }
      </UBadge>
    </Showcase>

    <Showcase
      title="关闭业务校验"
      description="通过 businessCheck 关闭校验 → legacy 接口缺 code 字段时仍按 dataKey 解包出业务数据。"
      :state="legacy.data.value"
    >
      <UBadge color="warning" variant="subtle">
        { businessCheck: false }
      </UBadge>
    </Showcase>

    <Showcase
      title="接管外部接口"
      description="同时关闭 businessCheck、unwrap → 非标信封原样返回，由调用方自行处理。"
      :state="external.data.value"
    >
      <UBadge color="error" variant="subtle">
        { businessCheck: false, unwrap: false }
      </UBadge>
    </Showcase>

    <Showcase
      title="端点级关闭解包"
      description="在端点 response 上声明 businessCheck、unwrap 为 false → 该端点所有请求直接拿到裸数组。"
      :state="endpointRaw.data.value"
    >
      <UBadge color="success" variant="subtle">
        { endpoint: 'raw' }
      </UBadge>
    </Showcase>

    <Showcase
      title="请求级覆盖端点"
      description="对关闭校验的端点传 businessCheck: true → 重新启用业务码校验，裸数组无 code 时抛出 business 错误。"
      :state="override.error.value?.data ?? override.data.value"
    >
      <UButton size="sm" variant="outline" icon="i-lucide-play" @click="override.execute()">
        { endpoint: 'raw', businessCheck: true }
      </UButton>
    </Showcase>
  </div>
</template>
