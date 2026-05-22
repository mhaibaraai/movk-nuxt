<script setup lang="ts">
const theme = useTheme()
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase
      title="集中配置界面主题"
      description="ThemePicker 统一调整 primary、neutral、圆角、字体、图标库和暗黑模式，并立即写入主题状态。"
    >
      <MThemePicker />
    </Showcase>

    <div class="flex flex-col gap-4">
      <Showcase title="实时主题状态" description="当前主题 token 会在面板操作后即时更新，便于确认配置是否生效。">
        <ClientOnly>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>primary: <UBadge :label="theme.primary.value" variant="subtle" /></div>
            <div>neutral: <UBadge :label="theme.neutral.value" variant="outline" /></div>
            <div>radius: {{ theme.radius.value }}rem</div>
            <div>font: {{ theme.font.value }}</div>
            <div>icons: {{ theme.icon.value }}</div>
            <div>mode: {{ theme.mode.value }}</div>
          </div>
          <template #fallback>
            <div class="grid grid-cols-2 gap-2 text-sm text-muted">
              <USkeleton class="h-5" />
              <USkeleton class="h-5" />
              <USkeleton class="h-5" />
              <USkeleton class="h-5" />
              <USkeleton class="h-5" />
              <USkeleton class="h-5" />
            </div>
          </template>
        </ClientOnly>
      </Showcase>

      <Showcase title="组件主题预览" description="按钮、徽章、复选框和开关会实时响应主题变量变化，展示全局视觉影响。">
        <div class="flex gap-2 flex-wrap">
          <UButton>主按钮</UButton>
          <UButton variant="outline">
            次按钮
          </UButton>
          <UButton color="success">
            成功
          </UButton>
          <UButton color="error">
            危险
          </UButton>
          <UBadge>Badge</UBadge>
          <UCheckbox model-value label="复选" />
          <USwitch model-value />
        </div>
      </Showcase>
    </div>
  </div>
</template>
