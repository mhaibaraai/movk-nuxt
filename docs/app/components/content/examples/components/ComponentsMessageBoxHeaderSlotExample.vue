<template>
  <MMessageBox
    mode="confirm"
    type="warning"
    title="原标题"
    description="原描述"
  >
    <UButton variant="outline" label="自定义头部" />
    <template #header>
      <div class="flex items-center gap-3 p-4 bg-warning/10 rounded-t-lg">
        <UIcon name="i-lucide-triangle-alert" class="size-8 text-warning" />
        <div>
          <div class="font-semibold">
            高风险操作
          </div>
          <div class="text-xs text-muted">
            头部插槽自定义整块布局
          </div>
        </div>
      </div>
    </template>
  </MMessageBox>
</template>
