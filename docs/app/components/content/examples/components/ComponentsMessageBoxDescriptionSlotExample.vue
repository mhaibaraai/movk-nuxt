<template>
  <MMessageBox
    mode="alert"
    type="info"
    title="版本更新说明"
  >
    <UButton variant="outline" label="查看说明" />
    <template #description>
      <span class="text-sm">
        v2.0 已发布，详见
        <a href="#" class="text-primary underline">完整变更日志</a>
        ，或继续使用旧版。
      </span>
    </template>
  </MMessageBox>
</template>
