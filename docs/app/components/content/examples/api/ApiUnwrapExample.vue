<script setup lang="ts">
const props = defineProps<{
  mode: 'default' | 'skip-unwrap' | 'skip-business-check' | 'combined'
}>()

const fetchers = {
  'default': useApiFetch('/profile', { key: 'unwrap-default', immediate: false }),
  'skip-unwrap': useApiFetch('/profile', { key: 'unwrap-skip-unwrap', immediate: false, skipUnwrap: true }),
  'skip-business-check': useApiFetch('/demo/legacy', { key: 'unwrap-skip-business-check', immediate: false, skipBusinessCheck: true }),
  'combined': useApiFetch('/demo/external', { key: 'unwrap-combined', immediate: false, skipBusinessCheck: true, skipUnwrap: true })
}

const active = computed(() => fetchers[props.mode])

const hints: Record<typeof props.mode, string> = {
  'default': '按 dataKey（默认 data）抽取业务数据，调用方直接拿到去信封后的对象。',
  'skip-unwrap': 'skipUnwrap: true 不重写 response._data，保留完整 code/message/data 信封。',
  'skip-business-check': 'legacy 接口未返回 code 字段，跳过校验后仍按 dataKey 解包出业务数据。',
  'combined': 'external 接口信封非标，同时开两开关由调用方完全自处理响应。'
}

watch(() => props.mode, () => active.value.execute(), { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge variant="subtle">
      {{ mode }}
    </UBadge>
    <p class="text-xs text-muted">
      {{ hints[mode] }}
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ active.data.value }}</pre>
  </div>
</template>
