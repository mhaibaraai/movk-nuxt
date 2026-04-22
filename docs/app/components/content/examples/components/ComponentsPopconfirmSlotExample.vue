<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      title="删除用户"
      :description="''"
      :on-confirm="() => { result = '用户已删除' }"
    >
      <template #body>
        <div class="flex flex-col gap-2 py-1">
          <p class="text-sm text-muted">
            即将删除以下用户，操作不可撤销：
          </p>
          <div class="flex items-center gap-2 rounded-md bg-elevated px-3 py-2">
            <UAvatar size="xs" icon="i-lucide-user" />
            <div class="flex flex-col">
              <span class="text-xs font-medium text-highlighted">张三</span>
              <span class="text-xs text-muted">zhangsan@example.com</span>
            </div>
          </div>
        </div>
      </template>

      <UButton color="error" variant="soft" label="删除用户" icon="i-lucide-user-x" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-error">{{ result }}</span>
  </div>
</template>
