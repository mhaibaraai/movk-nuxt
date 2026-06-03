<template>
  <MMessageBox
    mode="confirm"
    type="primary"
    title="步进式确认"
    description="footer 插槽接管按钮区，可自由组合多按钮、分组、状态等。"
  >
    <UButton variant="outline" label="自定义操作" />
    <template #footer="{ close }">
      <UButton color="neutral" variant="ghost" label="稍后处理" @click="close" />
      <UButton color="warning" variant="soft" label="保留并继续" @click="close" />
      <UButton color="primary" label="立即应用" @click="close" />
    </template>
  </MMessageBox>
</template>
