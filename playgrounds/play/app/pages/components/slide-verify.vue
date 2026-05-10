<script setup lang="ts">
import type { SemanticSize } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

const attrs = ref({
  size: ['md'] as SemanticSize[]
})

const log = ref<string[]>([])
const reloadKey = ref(0)

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 6)
}

function reset() {
  reloadKey.value++
  log.value = []
}
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
      重置
    </UButton>
  </Navbar>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <Matrix v-slot="props" :attrs="attrs">
      <div class="flex flex-col gap-2 min-w-65">
        <span class="text-xs text-muted">size = {{ props.size }}</span>
        <MSlideVerify
          :key="reloadKey"
          :size="props.size"
          @success="record(`success(size=${props.size})`)"
          @drag-end="(ok) => record(`dragEnd(${ok ? '✓' : '×'})`)"
        />
      </div>
      <div class="flex flex-col gap-2 min-w-65">
        <span class="text-xs text-muted">disabled</span>
        <MSlideVerify :size="props.size" disabled />
      </div>
      <div class="flex flex-col gap-2 min-w-65">
        <span class="text-xs text-muted">阈值 0.5（更宽松）</span>
        <MSlideVerify :key="reloadKey" :size="props.size" :threshold="0.5" text="拖到一半即通过" />
      </div>
    </Matrix>

    <StateViewer :state="log" label="事件日志" />
  </div>
</template>
