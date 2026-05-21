<script setup lang="ts">
// 1. 默认解包：业务数据从 envelope.data 字段抽出
const unwrapped = useApiFetch('/profile')

// 2. skipUnwrap：拿到完整 envelope（code/message/data）
const raw = useApiFetch('/profile', { skipUnwrap: true })

// 3. skipBusinessCheck：legacy 接口缺 code 字段，跳过校验后仍按 dataKey 解包
const legacy = useApiFetch('/demo/legacy', { skipBusinessCheck: true })

// 4. 组合：external 接口非标 envelope，两者同开 → 原样返回
const external = useApiFetch('/demo/external', {
  skipBusinessCheck: true,
  skipUnwrap: true
})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase
      title="默认解包"
      description="按 response.dataKey 默认 data 字段抽取业务数据，调用方直接拿到去信封后的对象"
      :state="unwrapped.data.value"
    >
      <UBadge variant="subtle">
        useApiFetch('/profile')
      </UBadge>
    </Showcase>

    <Showcase
      title="skipUnwrap 拿原始信封"
      description="skipUnwrap: true 不重写 response._data，调用方拿到 code/message/data 完整结构"
      :state="raw.data.value"
    >
      <UBadge color="info" variant="subtle">
        { skipUnwrap: true }
      </UBadge>
    </Showcase>

    <Showcase
      title="skipBusinessCheck 跳过 code 校验"
      description="legacy 接口未返回 code 字段，跳过业务校验后仍按 dataKey 解包出业务数据"
      :state="legacy.data.value"
    >
      <UBadge color="warning" variant="subtle">
        { skipBusinessCheck: true }
      </UBadge>
    </Showcase>

    <Showcase
      title="组合：接管外部接口"
      description="external 接口 envelope 非标，两个开关同时打开，调用方完全自处理响应"
      :state="external.data.value"
    >
      <UBadge color="error" variant="subtle">
        { skipBusinessCheck: true, skipUnwrap: true }
      </UBadge>
    </Showcase>
  </div>
</template>
