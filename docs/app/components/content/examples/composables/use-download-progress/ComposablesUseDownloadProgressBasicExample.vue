<script setup lang="ts">
const basic = useDownloadWithProgress()

function tip(s: string, e: { message: string } | null): string {
  if (s === 'pending') return '传输中'
  if (s === 'aborted') return '已取消'
  if (s === 'error') return e?.message || '失败'
  if (s === 'success') return '完成'
  return '空闲'
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2">
      <UButton
        :loading="basic.status.value === 'pending'"
        icon="i-lucide-download"
        @click="basic.download('/download/large')"
      >
        开始下载
      </UButton>
      <UButton
        v-if="basic.status.value === 'pending'"
        color="error"
        variant="soft"
        icon="i-lucide-x"
        @click="basic.abort"
      >
        中止
      </UButton>
    </div>
    <UProgress :model-value="basic.progress.value ?? undefined" :max="100" />
    <p class="text-xs text-muted">
      {{ basic.progress.value ?? 0 }}% · {{ tip(basic.status.value, basic.error.value) }}
    </p>
    <p class="text-xs text-muted">
      GET <code>/download/large</code>；<code>content-length</code> 已知时进度按比例更新。
    </p>
  </div>
</template>
