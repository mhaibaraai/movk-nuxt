<script setup lang="ts">
const theme = useTheme()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2 flex-wrap items-center">
      <UBadge :color="theme.hasCSSChanges.value ? 'warning' : 'neutral'" variant="subtle">
        CSS 已变更: {{ theme.hasCSSChanges.value }}
      </UBadge>
      <UBadge :color="theme.hasConfigChanges.value ? 'warning' : 'neutral'" variant="subtle">
        Config 已变更: {{ theme.hasConfigChanges.value }}
      </UBadge>
      <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="theme.resetTheme">
        重置主题
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>hasCSSChanges</code> / <code>hasConfigChanges</code> 标记主题是否偏离默认值；<code>resetTheme()</code> 恢复全部默认。
    </p>
  </div>
</template>
