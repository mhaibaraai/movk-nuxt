<script setup lang="ts">
const theme = useTheme()

const cssOutput = computed(() => theme.exportCSS())
const configOutput = computed(() => theme.exportConfig())
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
    <Showcase title="ThemePicker" description="组件内部即调用 useTheme()，写入会触发响应式 style 注入">
      <MThemePicker />
    </Showcase>

    <div class="flex flex-col gap-4">
      <Showcase title="实时 main.css 片段">
        <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ cssOutput }}</pre>
      </Showcase>

      <Showcase title="实时 app.config.ts 片段">
        <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ configOutput }}</pre>
      </Showcase>

      <Showcase title="hasCSSChanges / hasConfigChanges">
        <div class="flex gap-2">
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
      </Showcase>
    </div>
  </div>
</template>
