<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton color="neutral" variant="outline" label="布局定制示例" icon="i-lucide-layout" @click="open = true" />

    <MMessageBox
      v-model:open="open"
      mode="confirm"
      type="info"
      title="布局与样式定制"
      description="close-icon 覆盖右上角关闭按钮图标；ui.footer 控制底部按钮对齐方式；dismissible 允许点击遮罩层关闭。"
      close-icon="i-lucide-arrow-left"
      :ui="{ footer: 'justify-start' }"
      :dismissible="true"
    />
  </div>
</template>
