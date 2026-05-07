<script setup lang="ts">
const result = ref('')

async function handleSubmit() {
  await new Promise(resolve => setTimeout(resolve, 1500))
  result.value = '提交成功'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      type="primary"
      title="确认提交？"
      description="提交后将立即生效，请确认操作。"
      :on-confirm="handleSubmit"
      @confirm="result = '提交成功'"
    >
      <UButton color="primary" label="提交申请" icon="i-lucide-send" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-success">{{ result }}</span>
  </div>
</template>
