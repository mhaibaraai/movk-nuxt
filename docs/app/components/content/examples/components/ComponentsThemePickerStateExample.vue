<script setup lang="ts">
const theme = useTheme()
</script>

<template>
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
</template>
