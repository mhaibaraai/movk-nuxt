<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton color="warning" variant="soft" label="自定义图标" icon="i-lucide-shield-alert" @click="open = true" />

    <MMessageBox
      v-model:open="open"
      type="warning"
      title="安全警告"
      icon="i-lucide-shield-alert"
      description="使用 icon 属性可覆盖默认图标，自定义与业务场景匹配的视觉提示。"
    />
  </div>
</template>
