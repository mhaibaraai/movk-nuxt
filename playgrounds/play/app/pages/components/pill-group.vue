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
const matrixValue = ref<string | undefined>('进行中')

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

  <div class="p-4 flex flex-col gap-4">
    <Showcase title="继承字段上下文" description="放入 UFormField 后继承 size 与错误态，选项胶囊会按表单状态同步显示。" :state="{ value: formFieldValue }">
      <UFormField label="订阅方案" size="xs" error="示例错误态">
        <MPillGroup v-model="formFieldValue" :items="planItems" />
      </UFormField>
    </Showcase>

    <Showcase title="融入分组控件" description="与操作按钮放入 UFieldGroup 后共享尺寸和圆角，适合行内筛选与快捷清除。" :state="{ value: fieldGroupValue }">
      <UFieldGroup size="xs" class="w-full">
        <MPillGroup v-model="fieldGroupValue" :items="stringItems" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" @click="fieldGroupValue = undefined" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="字符串选项快速选择" description="传入字符串数组即可生成单选胶囊，选中值直接写入 v-model。" :state="{ value: basicValue }">
      <MPillGroup v-model="basicValue" :items="stringItems" />
    </Showcase>

    <Showcase title="结构化选项渲染" description="对象 items 可通过 labelKey、descriptionKey 与 icon 渲染复合内容，同时保留原始对象作为值。" :state="{ value: planValue }">
      <MPillGroup v-model="planValue" :items="planItems" />
    </Showcase>

    <Showcase title="多选集合管理" description="开启 multiple 后 modelValue 变为数组，用户可连续选择多个方案并实时同步状态。" :state="{ value: multiValue }">
      <MPillGroup v-model="multiValue" :items="planItems" multiple value-key="value" />
    </Showcase>

    <Showcase
      title="多选数量约束"
      :description="`min 与 max 约束选择数量：至少 ${MIN_COUNT} 项、最多 ${MAX_COUNT} 项，触顶时未选项变灰，触底时已选不可取消。`"
      :state="{ value: constrainedValue, min: MIN_COUNT, max: MAX_COUNT }"
    >
      <MPillGroup v-model="constrainedValue" :items="statusItems" multiple :min="MIN_COUNT" :max="MAX_COUNT" />
    </Showcase>

    <Showcase title="单选可取消" description="deselectable 允许再次点击当前项清空选择，适合非必选筛选条件。" :state="{ value: deselectableValue }">
      <MPillGroup v-model="deselectableValue" :items="planItems" deselectable />
    </Showcase>

    <Showcase title="自定义字段映射" description="labelKey 与 valueKey 指定从业务对象读取的展示字段与值字段，modelValue 只保存稳定 id。" :state="{ value: userValue }">
      <MPillGroup
        v-model="userValue"
        :items="userItems"
        label-key="name"
        value-key="id"
      />
    </Showcase>

    <Showcase title="按选项覆盖语义色" description="每个状态项可携带独立 color，渲染时按项应用，便于表达任务状态差异。" :state="{ value: statusValue }">
      <MPillGroup v-model="statusValue" :items="statusItems" />
    </Showcase>

    <Showcase title="局部与整体禁用" description="单项 disabled 会阻止该项交互，整体 disabled 会冻结整个选项组并保留当前值。" :state="{ partial: partialDisabledValue, full: fullDisabledValue }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="partialDisabledValue" :items="featureItems" />
        <MPillGroup v-model="fullDisabledValue" :items="featureItems" disabled />
      </div>
    </Showcase>

    <Showcase title="垂直排列选项" description="orientation 设为 vertical 将选项改为纵向堆叠，适合描述较长或移动端窄容器。" :state="{ value: verticalValue }">
      <MPillGroup v-model="verticalValue" :items="planItems" orientation="vertical" />
    </Showcase>

    <Showcase title="插槽定制选项内容" description="item-label 与 item-trailing 可接管局部渲染，选中标记会随 selected slot props 更新。" :state="{ value: slotValue }">
      <MPillGroup v-model="slotValue" :items="planItems" multiple>
        <template #item-label="{ item }">
          <span class="font-semibold">{{ getItemLabel(item) }}</span>
        </template>
        <template #item-trailing="{ selected }">
          <UIcon v-if="selected" name="i-lucide-check" class="size-3.5" />
        </template>
      </MPillGroup>
    </Showcase>

    <Showcase title="区分激活与未激活样式" description="activeVariant 与 inactiveVariant 可分别控制选中和未选状态，便于匹配不同密度的界面。" :state="{ value: variantValue }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="solid" inactive-variant="outline" />
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="subtle" inactive-variant="ghost" />
        <MPillGroup v-model="variantValue" :items="planItems" active-variant="outline" inactive-variant="link" />
      </div>
    </Showcase>

    <Showcase title="事件回调" description="点击选项依次触发 update:modelValue、change 与 select，可比较 payload 差异。">
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
          清空记录
        </UButton>
      </div>
      <template #aside>
        <StateViewer
          :state="{ modelValue: emitsValue, eventLog }"
          :label="`事件记录（最近 ${MAX_LOG} 条）`"
        />
      </template>
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs">
    <MPillGroup v-model="matrixValue" :items="stringItems" :size="props.size" :color="props.color" />
  </Matrix>
</template>
