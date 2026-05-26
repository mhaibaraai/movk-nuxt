<script setup lang="ts">
const open = ref(false)
const result = ref('')
</script>

<template>
  <div class="flex gap-2">
    <UButton variant="soft" @click="open = true">
      外部按钮打开
    </UButton>
    <UButton color="neutral" variant="outline" @click="open = false">
      外部按钮关闭
    </UButton>
    <span v-if="result" class="self-center text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-model:open="open"
      mode="confirm"
      type="primary"
      title="确认执行同步"
      :dismissible="false"
      :modal="false"
      description="open 由父组件持有，可被任意按钮、定时器或异步任务触发。"
      @close="(ok: boolean) => result = `受控 → ${ok}`"
    />
  </div>
</template>
