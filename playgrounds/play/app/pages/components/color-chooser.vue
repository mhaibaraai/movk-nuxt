<script setup lang="ts">
import type { ColorFormat, ColorChooserTrigger } from '@movk/nuxt'

const basic = ref('#0ea5e9')
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

const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl']
const triggers: ColorChooserTrigger[] = ['button', 'chip', 'input']

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

const enabledFormats = ref<ColorFormat[]>(['hex', 'rgb', 'hsl'])
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="基础用法" description="默认 button 触发器" :state="{ value: basic }">
      <MColorChooser v-model="basic" />
    </Showcase>

    <Showcase title="Format 切换 tab" description="在 popover 顶部切换 hex / rgb / hsl，输出格式实时变化" :state="{ value: formatsValue, enabledFormats }">
      <template #toolbar>
        <USelect v-model="enabledFormats" :items="(['hex', 'rgb', 'hsl'] as ColorFormat[])" multiple size="xs" placeholder="formats" />
      </template>
      <MColorChooser
        v-model="formatsValue"
        :formats="enabledFormats"
        @format-change="(fmt: ColorFormat) => logEvent('format-change', fmt)"
      />
    </Showcase>

    <Showcase title="预设色板（一维）" description="单行 swatches，点击即选中并默认关闭弹层" :state="{ value: swatchesValue }">
      <MColorChooser v-model="swatchesValue" :swatches="tailwindPalette" />
    </Showcase>

    <Showcase title="预设色板（二维分组）" description="多行 swatches，按色相 / 中性色分组" :state="{ value: groupedValue }">
      <MColorChooser
        v-model="groupedValue"
        :swatches="groupedSwatches"
        :close-on-swatch="false"
      />
    </Showcase>

    <Showcase title="复制 / 清除 actions" description="copyable + clearable 启用底部 actions 区" :state="{ value: actionsValue }">
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
        <StateViewer :state="{ value: actionsValue, eventLog }" label="Emits 状态" />
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" class="self-start" @click="clearLog">
          Clear log
        </UButton>
      </template>
    </Showcase>

    <Showcase title="Trigger = chip" description="仅圆形色点，常用于工具栏 / 颜色单元格" :state="{ value: chipValue }">
      <MColorChooser
        v-model="chipValue"
        trigger="chip"
        :swatches="tailwindPalette"
      />
    </Showcase>

    <Showcase title="Trigger = input" description="色点 + 可输入色值文本框，blur 时自动校验 hex" :state="{ value: inputValue }">
      <MColorChooser
        v-model="inputValue"
        trigger="input"
        :swatches="tailwindPalette"
        clearable
        copyable
      />
    </Showcase>

    <Showcase title="自定义触发器（default slot）" description="完全接管触发器渲染" :state="{ value: slotValue }">
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

    <Showcase title="ui prop 覆盖" description="把 swatches 网格改成 4 列、放大 swatch 尺寸" :state="{ value: uiValue }">
      <MColorChooser
        v-model="uiValue"
        :swatches="tailwindPalette"
        :ui="{
          swatches: 'grid grid-cols-4 gap-2',
          swatch: 'size-8 rounded-lg ring-2 ring-default cursor-pointer hover:ring-primary'
        }"
      />
    </Showcase>

    <Showcase title="禁用态" description="popover 不打开、input 只读" :state="{ value: disabledValue }">
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
