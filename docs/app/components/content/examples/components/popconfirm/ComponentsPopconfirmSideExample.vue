<script setup lang="ts">
type Side = 'top' | 'bottom' | 'left' | 'right'

const props = defineProps<{
  side: Side
}>()

const result = ref('')
const content = computed(() => ({ side: props.side }))
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      :content
      :title="`从 ${side} 方弹出`"
      description="透传 Popover 定位参数，支持 top / bottom / left / right。"
      :on-confirm="() => { result = `已从 ${side} 方确认` }"
    >
      <UButton color="neutral" variant="outline" label="打开确认框" icon="i-lucide-locate" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
