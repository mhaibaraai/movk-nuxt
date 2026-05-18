<script setup lang="ts">
import type { PillItem, PillSelectPayload, SemanticColor, SemanticSize } from '@movk/nuxt'

const stringItems = ['全部', '进行中', '已完成', '已归档']

const planItems: PillItem[] = [
  { value: 'free', label: '免费版', description: '基础功能 / 1 用户', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', description: '团队协作 / 10 用户', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', description: '自定义 SLA / 不限', icon: 'i-lucide-building' }
]

const statusItems: PillItem[] = [
  { value: 'todo', label: '待办', icon: 'i-lucide-circle', color: 'neutral' },
  { value: 'doing', label: '进行中', icon: 'i-lucide-loader', color: 'warning' },
  { value: 'done', label: '已完成', icon: 'i-lucide-check-circle', color: 'success' },
  { value: 'block', label: '阻塞', icon: 'i-lucide-octagon-x', color: 'error' }
]

const featureItems: PillItem[] = [
  { value: 'a', label: 'Feature A', icon: 'i-lucide-sparkles' },
  { value: 'b', label: 'Feature B（敬请期待）', icon: 'i-lucide-clock', disabled: true },
  { value: 'c', label: 'Feature C', icon: 'i-lucide-rocket' }
]

const userItems = [
  { id: 'u1', name: 'Alice', avatar: { src: 'https://i.pravatar.cc/40?img=1' } },
  { id: 'u2', name: 'Bob', avatar: { src: 'https://i.pravatar.cc/40?img=2' } },
  { id: 'u3', name: 'Carol', avatar: { src: 'https://i.pravatar.cc/40?img=3' } }
] as PillItem[]

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const formFieldValue = ref<PillItem | undefined>(planItems[1])
const fieldGroupValue = ref<string | undefined>('全部')
const basicValue = ref<string | undefined>('全部')
const planValue = ref<PillItem | undefined>(planItems[0])
const multiValue = ref<string[]>(['free', 'pro'])
const constrainedValue = ref<PillItem[]>([statusItems[1]!, statusItems[2]!])
const deselectableValue = ref<PillItem | undefined>(planItems[0])
const userValue = ref<string | undefined>('u1')
const statusValue = ref<PillItem | undefined>(statusItems[1])
const partialDisabledValue = ref<PillItem | undefined>(featureItems[0])
const fullDisabledValue = ref<PillItem | undefined>(featureItems[0])
const verticalValue = ref<PillItem | undefined>(planItems[1])
const slotValue = ref<PillItem[]>([planItems[1]!])
const variantValue = ref<PillItem | undefined>(planItems[1])
const emitsValue = ref<PillItem[]>([planItems[1]!])
const matrixValue = ref<PillItem | undefined>(planItems[1])

const MIN_COUNT = 1
const MAX_COUNT = 3

interface EventEntry {
  id: number
  name: 'update:modelValue' | 'change' | 'select'
  payload: unknown
  time: string
}

const eventLog = ref<EventEntry[]>([])
let eventSeq = 0
const MAX_LOG = 8

function logEvent(name: EventEntry['name'], payload: unknown) {
  eventLog.value = [
    {
      id: ++eventSeq,
      name,
      payload,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
    },
    ...eventLog.value
  ].slice(0, MAX_LOG)
}

function onSelect(payload: PillSelectPayload<PillItem>) {
  const itemLabel = typeof payload.item === 'object' && payload.item
    ? payload.item.label ?? String(payload.item.value)
    : String(payload.item)
  logEvent('select', { label: itemLabel, selected: payload.selected, index: payload.index })
}

function clearLog() {
  eventLog.value = []
}

function getItemLabel(item: PillItem): string {
  if (typeof item === 'object' && item) return item.label ?? String(item.value)
  return String(item)
}
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="UFormField 兼容" description="外层字段尺寸和错误态传递到 pill" :state="{ value: formFieldValue }">
      <UFormField label="订阅方案" size="xs" error="示例错误态">
        <MPillGroup v-model="formFieldValue" :items="planItems" />
      </UFormField>
    </Showcase>

    <Showcase title="UFieldGroup 兼容" description="pill 与按钮共同继承分组尺寸与圆角" :state="{ value: fieldGroupValue }">
      <UFieldGroup size="xs" class="w-full">
        <MPillGroup v-model="fieldGroupValue" :items="stringItems" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" @click="fieldGroupValue = undefined" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="基础用法" description="传入字符串数组即用" :state="{ value: basicValue }">
      <MPillGroup v-model="basicValue" :items="stringItems" />
    </Showcase>

    <Showcase title="对象 items + 描述/图标" description="默认 labelKey='label'，descriptionKey='description'" :state="{ value: planValue }">
      <MPillGroup v-model="planValue" :items="planItems" />
    </Showcase>

    <Showcase title="多选模式" description="multiple=true 时 modelValue 为数组" :state="{ value: multiValue }">
      <MPillGroup v-model="multiValue" :items="planItems" multiple value-key="value" />
    </Showcase>

    <Showcase
      title="多选 min/max 约束"
      :description="`至少保留 ${MIN_COUNT} 项，最多 ${MAX_COUNT} 项；触顶时未选项变灰，触底时已选不可取消`"
      :state="{ value: constrainedValue, min: MIN_COUNT, max: MAX_COUNT }"
    >
      <MPillGroup v-model="constrainedValue" :items="statusItems" multiple :min="MIN_COUNT" :max="MAX_COUNT" />
    </Showcase>

    <Showcase title="单选 deselectable" description="再次点击当前选项即清空" :state="{ value: deselectableValue }">
      <MPillGroup v-model="deselectableValue" :items="planItems" deselectable />
    </Showcase>

    <Showcase title="头像 + 自定义 valueKey" description="labelKey='name'，valueKey='id'，modelValue 为 id 字符串" :state="{ value: userValue }">
      <MPillGroup
        v-model="userValue"
        :items="userItems"
        label-key="name"
        value-key="id"
      />
    </Showcase>

    <Showcase title="按项覆盖 color" description="每个 status item 自带语义色，渲染时按项生效" :state="{ value: statusValue }">
      <MPillGroup v-model="statusValue" :items="statusItems" />
    </Showcase>

    <Showcase title="禁用态" description="单项 disabled 与整体 disabled" :state="{ partial: partialDisabledValue, full: fullDisabledValue }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="partialDisabledValue" :items="featureItems" />
        <MPillGroup v-model="fullDisabledValue" :items="featureItems" disabled />
      </div>
    </Showcase>

    <Showcase title="竖向排列" description="orientation='vertical'" :state="{ value: verticalValue }">
      <MPillGroup v-model="verticalValue" :items="planItems" orientation="vertical" />
    </Showcase>

    <Showcase title="自定义 slot" description="item-label 加粗，item-trailing 显示选中标记" :state="{ value: slotValue }">
      <MPillGroup v-model="slotValue" :items="planItems" multiple>
        <template #item-label="{ item }">
          <span class="font-semibold">{{ getItemLabel(item) }}</span>
        </template>
        <template #item-trailing="{ selected }">
          <UIcon v-if="selected" name="i-lucide-check" class="size-3.5" />
        </template>
      </MPillGroup>
    </Showcase>

    <Showcase title="active/inactive variant" description="自由组合激活态与未激活态视觉" :state="{ value: variantValue }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="solid" inactive-variant="outline" />
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="subtle" inactive-variant="ghost" />
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="outline" inactive-variant="link" />
      </div>
    </Showcase>

    <Showcase title="Emits 演示" description="点击 pill 触发 update:modelValue / change / select 三类事件">
      <div class="flex flex-wrap items-start gap-3">
        <MPillGroup
          v-model="emitsValue"
          :items="planItems"
          multiple
          @update:model-value="(v) => logEvent('update:modelValue', v)"
          @change="(v) => logEvent('change', v)"
          @select="onSelect"
        />
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" @click="clearLog">
          Clear log
        </UButton>
      </div>
      <template #aside>
        <StateViewer
          :state="{ modelValue: emitsValue, eventLog }"
          :label="`Emits 状态（最近 ${MAX_LOG} 条）`"
        />
      </template>
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs" class="p-4">
    <UFormField :label="`${props.size} · ${props.color}`" size="xs">
      <MPillGroup v-model="matrixValue" :items="planItems" :size="props.size" :color="props.color" />
    </UFormField>
  </Matrix>
</template>
