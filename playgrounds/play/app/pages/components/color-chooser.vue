<script setup lang="ts">
import type { ColorChooserProps } from '@movk/nuxt'

const basic = ref('#0ea5e9')
const formFieldValue = ref('#0ea5e9')
const fieldGroupValue = ref('#22c55e')
const formatsValue = ref('#22c55e')
const swatchesValue = ref('#ef4444')
const groupedValue = ref('#3b82f6')
const actionsValue = ref('#a855f7')
const chipValue = ref('#f59e0b')
const inputValue = ref('#10b981')
const slotValue = ref('#ec4899')
const uiValue = ref('#14b8a6')
const disabledValue = ref('#6b7280')
const matrixValue = ref('#0ea5e9')

const tailwindPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

const groupedSwatches: string[][] = [
  ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6'],
  ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
  ['#0a0a0a', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5', '#ffffff']
]

const sizes: NonNullable<ColorChooserProps['size']>[] = ['xs', 'sm', 'md', 'lg', 'xl']
const triggers: NonNullable<ColorChooserProps['trigger']>[] = ['button', 'chip', 'input']

interface EventEntry {
  id: number
  name: 'change' | 'clear' | 'copy' | 'format-change'
  payload: unknown
  time: string
}

const eventLog = ref<EventEntry[]>([])
let seq = 0
function logEvent(name: EventEntry['name'], payload: unknown) {
  eventLog.value = [
    { id: ++seq, name, payload, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
    ...eventLog.value
  ].slice(0, 8)
}

function clearLog() {
  eventLog.value = []
}

const enabledFormats = ref<ColorChooserProps['formats']>(['hex', 'rgb', 'hsl'])
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="继承字段上下文" description="放入 UFormField 后继承 size 与错误态，颜色触发器会按表单状态渲染。" :state="{ value: formFieldValue }">
      <UFormField label="品牌色" size="xs" error="示例错误态">
        <MColorChooser
          v-model="formFieldValue"
          :formats="['hex', 'rgb', 'hsl']"
        />
      </UFormField>
    </Showcase>

    <Showcase title="融入分组控件" description="颜色输入触发器与按钮共享 UFieldGroup 尺寸，适合表单行内的取色操作。" :state="{ value: fieldGroupValue }">
      <UFieldGroup size="xs" class="w-full">
        <MColorChooser v-model="fieldGroupValue" trigger="input" />
        <UButton icon="i-lucide-pipette" color="neutral" variant="subtle" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="按钮触发取色" description="默认 button 触发器展示当前色值，打开弹层后可从面板选择并同步 v-model。" :state="{ value: basic }">
      <MColorChooser v-model="basic" />
    </Showcase>

    <Showcase
      title="切换颜色输出格式"
      description="在 popover 顶部切换 hex、rgb、hsl，当前值会转换为对应格式并触发 format-change。"
      :state="{ value: formatsValue, enabledFormats }"
    >
      <template #toolbar>
        <USelect
          v-model="enabledFormats"
          :items="['hex', 'rgb', 'hsl']"
          multiple
          size="xs"
          placeholder="formats"
        />
      </template>
      <MColorChooser
        v-model="formatsValue"
        :formats="enabledFormats"
        @format-change="(fmt) => logEvent('format-change', fmt)"
      />
    </Showcase>

    <Showcase title="单组预设色板" description="一维 swatches 渲染为连续色板，点击色块会选中颜色并默认关闭弹层。" :state="{ value: swatchesValue }">
      <MColorChooser v-model="swatchesValue" :swatches="tailwindPalette" />
    </Showcase>

    <Showcase title="分组预设色板" description="二维 swatches 按行分组展示色相与中性色，可通过 closeOnSwatch 控制选择后是否关闭。" :state="{ value: groupedValue }">
      <MColorChooser v-model="groupedValue" :swatches="groupedSwatches" :close-on-swatch="false" />
    </Showcase>

    <Showcase
      title="复制与清除操作"
      description="copyable 与 clearable 会启用底部 actions 区，复制、清除和值变化都会写入事件日志。"
      :state="{ value: actionsValue }"
    >
      <MColorChooser
        v-model="actionsValue"
        copyable
        clearable
        :swatches="tailwindPalette"
        @copy="(v: string) => logEvent('copy', v)"
        @clear="() => logEvent('clear', undefined)"
        @change="(v: string | undefined) => logEvent('change', v)"
      />
      <template #aside>
        <StateViewer :state="{ value: actionsValue, eventLog }" label="事件记录" />
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" class="self-start" @click="clearLog">
          清空记录
        </UButton>
      </template>
    </Showcase>

    <Showcase title="色点触发器" description="trigger='chip' 只渲染紧凑色点，适合工具栏、表格单元格或空间受限场景。" :state="{ value: chipValue }">
      <MColorChooser
        v-model="chipValue"
        :ui="{
          triggerChip: 'size-4'
        }"
        trigger="chip"
        :swatches="tailwindPalette"
      />
    </Showcase>

    <Showcase title="输入型触发器" description="trigger='input' 提供色点与文本输入，blur 时校验 hex 并同步有效色值。" :state="{ value: inputValue }">
      <MColorChooser v-model="inputValue" trigger="input" :swatches="tailwindPalette" clearable copyable />
    </Showcase>

    <Showcase title="自定义触发器渲染" description="default slot 可完全接管触发器外观，同时通过 open 与 value slot props 保持弹层状态可见。" :state="{ value: slotValue }">
      <MColorChooser v-model="slotValue" :swatches="tailwindPalette">
        <template #default="{ open, value }">
          <button
            type="button"
            class="size-12 rounded-xl border-2 border-default cursor-pointer hover:scale-105 transition flex items-center justify-center"
            :style="{ backgroundColor: value }"
            :aria-expanded="open"
          >
            <UIcon v-if="!value" name="i-lucide-plus" class="text-muted" />
          </button>
        </template>
      </MColorChooser>
    </Showcase>

    <Showcase title="覆盖内部 UI slots" description="ui prop 可定制 swatches 网格和 swatch 尺寸，不影响取色、复制和清除机制。" :state="{ value: uiValue }">
      <MColorChooser
        v-model="uiValue"
        :swatches="tailwindPalette"
        :ui="{
          swatches: 'grid grid-cols-4 gap-2',
          swatch: 'size-8 rounded-lg ring-2 ring-default cursor-pointer hover:ring-primary'
        }"
      />
    </Showcase>

    <Showcase title="禁用交互状态" description="disabled 会阻止 popover 打开，并让 input 触发器进入只读状态，当前值保持可展示。" :state="{ value: disabledValue }">
      <div class="flex flex-wrap items-center gap-3">
        <MColorChooser v-model="disabledValue" disabled />
        <MColorChooser v-model="disabledValue" trigger="chip" disabled />
        <MColorChooser v-model="disabledValue" trigger="input" disabled />
      </div>
    </Showcase>
  </div>

  <Matrix v-slot="{ size, trigger }" :attrs="{ size: sizes, trigger: triggers }" class="p-4">
    <UFormField :label="`${size} · ${trigger}`" size="xs">
      <MColorChooser
        v-model="matrixValue"
        :size="size"
        :trigger="trigger"
        :swatches="tailwindPalette"
        copyable
        clearable
      />
    </UFormField>
  </Matrix>
</template>
