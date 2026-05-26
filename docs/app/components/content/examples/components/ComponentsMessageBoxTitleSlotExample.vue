<template>
  <MMessageBox
    mode="confirm"
    type="primary"
    title="原标题文案"
    description="标题区由 #title 插槽决定，原 title prop 不会渲染。"
  >
    <UButton variant="outline" label="自定义标题" />
    <template #title>
      <UIcon name="i-lucide-sparkles" class="size-5 text-primary" />
      <span class="font-bold text-primary">完全自定义的标题样式</span>
      <UBadge color="primary" variant="subtle" label="NEW" />
    </template>
  </MMessageBox>
</template>
