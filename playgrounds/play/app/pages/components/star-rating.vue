<script setup lang="ts">
import type { SemanticSize, SemanticColor } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const value = ref(3)
const formFieldRating = ref(3)
const fieldGroupRating = ref(4)
const halfValue = ref(3.5)
const clearableValue = ref(2.5)
const readonlyValue = ref(4)
const disabledValue = ref(2)
const maxValue = ref(5)
const iconValue = ref(2.5)
const badgeValue = ref(3)
const highlightValue = ref(3)
const buttonPropsValue = ref(3)

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

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="继承字段上下文" description="放入 UFormField 后接收字段尺寸和错误态，评分图标会随表单状态更新。" :state="{ value: formFieldRating }">
      <UFormField label="满意度" size="xs" error="示例错误态">
        <MStarRating v-model="formFieldRating" />
      </UFormField>
    </Showcase>

    <Showcase title="融入`UFieldGroup`" description="评分控件与重置按钮共享 UFieldGroup 尺寸，适合在紧凑表单行内组合操作。" :state="{ value: fieldGroupRating }">
      <UFieldGroup size="xs" class="w-full">
        <MStarRating v-model="fieldGroupRating" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" @click="fieldGroupRating = 0" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="允许半星评分" description="allowHalf 让每颗星可取半值，点击左右半区分别记为 .5 与整数评分。" :state="{ value: halfValue }">
      <MStarRating v-model="halfValue" allow-half />
    </Showcase>

    <Showcase title="可清除评分" description="clearable 允许再次点击当前值或按 Backspace 将评分清零，适合非必填场景。" :state="{ value: clearableValue }">
      <MStarRating v-model="clearableValue" allow-half clearable />
    </Showcase>

    <Showcase title="只读与禁用对照" description="readonly 仅展示评分并保留视觉，disabled 同时阻止交互并降低不透明度。" :state="{ readonly: readonlyValue, disabled: disabledValue }">
      <div class="flex flex-col gap-3">
        <MStarRating v-model="readonlyValue" readonly />
        <MStarRating v-model="disabledValue" disabled />
      </div>
    </Showcase>

    <Showcase title="自定义星级总数" description="max 调整星星数量，这里设为 7 颗以适配更细粒度的评分量表。" :state="{ value: maxValue }">
      <MStarRating v-model="maxValue" :max="7" />
    </Showcase>

    <Showcase title="替换评分图标" description="emptyIcon、filledIcon、halfIcon 可整体替换为其他图标，配合 allowHalf 呈现半值形态。" :state="{ value: iconValue }">
      <MStarRating
        v-model="iconValue"
        allow-half
        empty-icon="i-lucide-heart"
        filled-icon="i-lucide-heart"
        half-icon="i-lucide-heart-handshake"
      />
    </Showcase>

    <Showcase title="隐藏评分徽章" description="showBadge 默认显示当前分值徽章，设为 false 后只保留星星本身。" :state="{ value: badgeValue }">
      <div class="flex flex-col gap-3">
        <MStarRating v-model="badgeValue" />
        <MStarRating v-model="badgeValue" :show-badge="false" />
      </div>
    </Showcase>

    <Showcase title="高亮聚焦态" description="highlight 为评分控件加上类聚焦的环形高亮，用于强调当前可操作项。" :state="{ value: highlightValue }">
      <MStarRating v-model="highlightValue" highlight />
    </Showcase>

    <Showcase title="透传按钮属性" description="buttonProps 透传到每颗星的按钮，可统一调整变体、内边距等底层样式。" :state="{ value: buttonPropsValue }">
      <MStarRating v-model="buttonPropsValue" :button-props="{ variant: 'soft' }" />
    </Showcase>

    <Showcase
      title="事件回调"
      description="点击、悬浮与键盘交互依次触发 update:modelValue、change 与 hover，连续 hover 会折叠为一条记录。"
    >
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
          清空记录
        </UButton>
      </div>
      <template #aside>
        <StateViewer
          :state="{ modelValue: emitsValue, hoverValue, eventLog }"
          :label="`事件记录（最近 ${MAX_LOG} 条）`"
        />
      </template>
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs">
    <MStarRating v-model="value" :size="props.size" :color="props.color" />
  </Matrix>
</template>
