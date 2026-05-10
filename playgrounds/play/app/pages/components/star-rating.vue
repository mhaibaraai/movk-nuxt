<script setup lang="ts">
import type { SemanticSize, SemanticColor } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const value = ref(3)
const halfValue = ref(3.5)
const clearableValue = ref(2.5)

const emitsValue = ref(2.5)
const hoverValue = ref<number | null>(null)

interface EventEntry {
  id: number
  name: 'update:modelValue' | 'change' | 'hover'
  payload: number | null
  time: string
}

const eventLog = ref<EventEntry[]>([])
let eventSeq = 0
const MAX_LOG = 8

function logEvent(name: EventEntry['name'], payload: number | null) {
  const entry: EventEntry = {
    id: ++eventSeq,
    name,
    payload,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }
  const [head, ...rest] = eventLog.value
  if (name === 'hover' && head?.name === 'hover') {
    eventLog.value = [entry, ...rest]
    return
  }
  eventLog.value = [entry, ...eventLog.value].slice(0, MAX_LOG)
}

function onHover(v: number | null) {
  hoverValue.value = v
  logEvent('hover', v)
}

function clearLog() {
  eventLog.value = []
}
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <UFormField label="Emits 演示" help="点击 / 悬浮 / 键盘交互（含 Backspace 清零）均会写入日志。" class="p-4">
    <div class="flex flex-wrap items-start gap-6">
      <MStarRating
        v-model="emitsValue"
        allow-half
        clearable
        @update:model-value="(v) => logEvent('update:modelValue', v)"
        @change="(v) => logEvent('change', v)"
        @hover="onHover"
      />
      <UButton size="xs" variant="ghost" :disabled="!eventLog.length" @click="clearLog">
        Clear log
      </UButton>
    </div>
    <StateViewer
      :state="{ modelValue: emitsValue, hoverValue, eventLog }"
      :label="`Emits 状态（日志最近 ${MAX_LOG} 条，连续 hover 已折叠）`"
      class="mt-3"
    />
  </UFormField>

  <Matrix v-slot="props" :attrs="attrs">
    <UFormField :label="`${props.size} · ${props.color}`" size="xs">
      <MStarRating v-model="value" :size="props.size" :color="props.color" />
    </UFormField>
    <MStarRating v-model="halfValue" allow-half :size="props.size" :color="props.color" />
    <MStarRating :model-value="4" readonly :size="props.size" :color="props.color" />
    <MStarRating :model-value="2" disabled :size="props.size" :color="props.color" :show-badge="false" />
    <MStarRating :model-value="3" :max="6" clearable :size="props.size" :color="props.color" />
    <UFormField label="clearable + allow-half" help="点击当前值或按 Backspace 可清零" size="xs">
      <MStarRating
        v-model="clearableValue"
        allow-half
        clearable
        :size="props.size"
        :color="props.color"
      />
    </UFormField>
    <MStarRating
      allow-half
      :model-value="2.5"
      empty-icon="i-lucide-heart"
      filled-icon="i-lucide-heart"
      half-icon="i-lucide-heart-handshake"
      :size="props.size"
      :color="props.color"
    />
  </Matrix>
</template>
