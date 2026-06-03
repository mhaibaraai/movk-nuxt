<template>
  <MMessageBox title="原标题">
    <UButton variant="soft" color="primary" label="极致定制" />
    <template #content="{ close }">
      <div class="p-6 flex flex-col items-center gap-4 text-center">
        <UIcon name="i-lucide-party-popper" class="size-12 text-primary" />
        <div class="text-lg font-semibold">
          恭喜达成成就
        </div>
        <p class="text-sm text-muted">
          content 插槽替代 header/body/footer 三段式，可完全自定义内部结构。
        </p>
        <UButton label="收下奖励" @click="close" />
      </div>
    </template>
  </MMessageBox>
</template>
