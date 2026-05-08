<script setup lang="ts">
const theme = useTheme()
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase
      title="ThemePicker 完整面板"
      description="主题色 / neutral / 圆角 / 字体 / 图标库 / 暗黑模式"
    >
      <MThemePicker />
    </Showcase>

    <div class="flex flex-col gap-4">
      <Showcase title="实时主题状态">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>primary: <UBadge :label="theme.primary.value" variant="subtle" /></div>
          <div>neutral: <UBadge :label="theme.neutral.value" variant="outline" /></div>
          <div>radius: {{ theme.radius.value }}rem</div>
          <div>font: {{ theme.font.value }}</div>
          <div>icons: {{ theme.icon.value }}</div>
          <div>mode: {{ theme.mode.value }}</div>
        </div>
      </Showcase>

      <Showcase title="组件实时预览">
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
