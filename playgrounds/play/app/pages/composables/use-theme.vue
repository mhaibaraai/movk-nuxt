<script setup lang="ts">
const theme = useTheme()

const cssOutput = computed(() => theme.exportCSS())
const configOutput = computed(() => theme.exportConfig())
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
    <Showcase
      title="主题变量即时注入"
      description="MThemePicker 通过 useTheme() 写入主题状态，页面样式即时跟随更新"
    >
      <MThemePicker />
    </Showcase>

    <div class="flex flex-col gap-4">
      <Showcase
        title="CSS 变量导出"
        description="exportCSS() 将当前主题差异序列化为 main.css 片段"
      >
        <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ cssOutput }}</pre>
      </Showcase>

      <Showcase
        title="App Config 导出"
        description="exportConfig() 生成可写入 app.config.ts 的主题配置片段"
      >
        <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ configOutput }}</pre>
      </Showcase>

      <Showcase
        title="变更标记与重置"
        description="hasCSSChanges、hasConfigChanges 标记主题偏离，重置按钮恢复默认"
      >
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
