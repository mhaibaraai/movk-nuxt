<template>
  <MMessageBox
    mode="alert"
    type="info"
    title="自定义关闭按钮"
    description="close 插槽完全替换默认关闭按钮。"
  >
    <UButton variant="outline" label="查看" />
    <template #close>
      <UButton size="xs" color="error" variant="ghost" icon="i-lucide-x-circle" />
    </template>
  </MMessageBox>
</template>
