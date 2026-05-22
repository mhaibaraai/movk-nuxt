<script setup lang="ts">
const sides = ['top', 'bottom', 'left', 'right'] as const
type Side = typeof sides[number]

const selected = ref<Side>('top')
const result = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="side in sides"
        :key="side"
        size="xs"
        :variant="selected === side ? 'solid' : 'outline'"
        color="neutral"
        :label="side"
        @click="selected = side"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <MPopconfirm
        :content="{ side: selected }"
        :title="`从 ${selected} 方弹出`"
        description="透传 Popover 定位参数，支持 top / bottom / left / right。"
        :on-confirm="() => { result = `已从 ${selected} 方确认` }"
      >
        <UButton color="neutral" variant="outline" label="打开确认框" icon="i-lucide-locate" />
      </MPopconfirm>

      <span v-if="result" class="text-sm text-muted">{{ result }}</span>
    </div>
  </div>
</template>
