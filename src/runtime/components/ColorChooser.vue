<script lang="ts" setup generic="M extends 'click' | 'hover'">
import type { ButtonProps, ColorPickerProps, ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { computed, ref, useAttrs, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ColorTranslator } from 'colortranslator'
import { UPopover, UButton, UColorPicker, UIcon, UInput } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import { useFieldControl } from '../utils/form-control'
import theme from '#build/movk-ui/color-chooser'
import popoverTheme from '#build/ui/popover'
import PillGroup from './PillGroup.vue'
import type { PillsItem } from '../types/components/pill-group'
import type { ColorChooserProps, ColorChooserEmits, ColorChooserSlots, ColorFormat } from '../types/components/color-chooser'

interface _Props extends ColorChooserProps<M> {
  size?: ComponentConfig<typeof popoverTheme & typeof theme, AppConfig, 'colorChooser'>['variants']['size']
  trigger?: ComponentConfig<typeof popoverTheme & typeof theme, AppConfig, 'colorChooser'>['variants']['trigger']
  ui?: ComponentConfig<typeof popoverTheme & typeof theme, AppConfig, 'colorChooser'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  format: 'hex',
  formats: () => ['hex'],
  closeOnSwatch: true,
  trigger: 'button',
  placeholder: '选择颜色',
  color: 'neutral',
  variant: 'subtle',
  icon: 'i-lucide-palette'
})

const modelValue = defineModel<string>()
const emits = defineEmits<ColorChooserEmits>()
const slots = defineSlots<ColorChooserSlots>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { colorChooser?: unknown } }
const {
  id,
  name,
  size: effectiveSize,
  color: effectiveColor,
  highlight,
  disabled: effectiveDisabled,
  ariaAttrs,
  emitFormBlur,
  emitFormChange,
  emitFormFocus,
  emitFormInput
} = useFieldControl(props)

const FORMAT_KEY = {
  hex: 'HEX',
  rgb: 'RGB',
  hsl: 'HSL',
  cmyk: 'CMYK',
  lab: 'CIELab'
} as const

function convertColor(value: string | undefined, fmt: ColorFormat): string | undefined {
  if (!value) return value
  try {
    const key = FORMAT_KEY[fmt as keyof typeof FORMAT_KEY]
    if (!key) return value
    return new ColorTranslator(value)[key] as string
  }
  catch {
    return value
  }
}

const openState = ref(false)
const currentFormat = ref<ColorFormat>(props.formats?.[0] ?? props.format ?? 'hex')

const inputDraft = ref(modelValue.value ?? '')
watch(modelValue, (val) => {
  inputDraft.value = val ?? ''
})
watch(() => props.format, (val) => {
  if (val) currentFormat.value = val
})

const showFormatTabs = computed(() => (props.formats?.length ?? 0) >= 2)

const formatItems = computed<PillsItem[]>(() =>
  (props.formats ?? []).map(f => ({ label: f.toUpperCase(), value: f }))
)

const swatchRows = computed<string[][]>(() => {
  const sw = props.swatches
  if (!sw || sw.length === 0) return []
  return Array.isArray(sw[0]) ? (sw as string[][]) : [sw as string[]]
})

const hasSwatches = computed(() => swatchRows.value.length > 0)

const { baseUi, extraUi } = useExtendedTv(
  popoverTheme,
  theme,
  () => appConfig.movk?.colorChooser,
  () => ({
    ui: props.ui,
    variants: {
      size: effectiveSize.value,
      trigger: props.trigger,
      disabled: effectiveDisabled.value
    }
  })
)

const triggerButtonAttrs = computed<ButtonProps>(() => ({
  color: effectiveColor.value,
  variant: props.variant,
  size: effectiveSize.value as ButtonProps['size'],
  disabled: effectiveDisabled.value,
  square: props.trigger === 'chip'
}))

const triggerLabel = computed(() => props.label ?? modelValue.value ?? props.placeholder)

const colorPickerAttrs = computed<ColorPickerProps>(() => ({
  ...(props.colorPickerProps ?? {}),
  format: currentFormat.value,
  disabled: effectiveDisabled.value
}))

const { copy, isSupported: clipboardSupported } = useClipboard()

function selectFormat(fmt: ColorFormat) {
  if (fmt === currentFormat.value) return
  currentFormat.value = fmt
  const converted = convertColor(modelValue.value, fmt)
  if (converted !== modelValue.value) {
    commitValue(converted)
  }
  emits('format-change', fmt)
}

function selectSwatch(c: string) {
  commitValue(c)
  if (props.closeOnSwatch) openState.value = false
}

function handleCopy() {
  const v = modelValue.value
  if (!v) return
  if (clipboardSupported.value) copy(v)
  emits('copy', v)
}

function handleClear() {
  commitValue(undefined)
  emits('clear')
}

function handlePickerUpdate(v: string | undefined) {
  commitValue(v)
}

function handleInputBlur() {
  emitFormBlur()
  const v = inputDraft.value.trim()
  if (!v) {
    commitValue(undefined)
    return
  }
  const normalized = convertColor(v, currentFormat.value)
  const hexInvalid = currentFormat.value === 'hex' && !/^#?(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)
  if (!normalized || (normalized === v && hexInvalid)) {
    inputDraft.value = modelValue.value ?? ''
    return
  }
  commitValue(normalized)
}

function handleOpenUpdate(val: boolean) {
  if (val && effectiveDisabled.value) return
  openState.value = val
  emits('update:open', val)
}

function commitValue(value: string | undefined) {
  modelValue.value = value
  emits('change', value)
  emitFormInput()
  emitFormChange()
}
</script>

<template>
  <UPopover v-bind="attrs" :open="openState" :ui="baseUi" @update:open="handleOpenUpdate">
    <template #default="{ open }">
      <slot :open="open" :value="modelValue">
        <UButton
          v-if="props.trigger === 'chip'"
          :id="id"
          :name="name"
          v-bind="{ ...triggerButtonAttrs, ...ariaAttrs }"
          :aria-label="modelValue || props.placeholder"
          @blur="emitFormBlur"
          @focus="emitFormFocus"
        >
          <span :class="extraUi.triggerChip" :style="{ backgroundColor: modelValue || 'transparent' }">
            <UIcon v-if="!modelValue" :name="props.icon" :class="extraUi.triggerIcon" />
          </span>
        </UButton>

        <div v-else-if="props.trigger === 'input'">
          <UInput
            :id="id"
            v-model="inputDraft"
            :name="name"
            :size="effectiveSize"
            :color="effectiveColor"
            :highlight="highlight"
            :placeholder="props.placeholder"
            :disabled="effectiveDisabled"
            v-bind="ariaAttrs"
            @blur="handleInputBlur"
            @focus="emitFormFocus"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          >
            <template #leading>
              <slot name="leading" :value="modelValue">
                <span
                  v-if="modelValue"
                  :class="extraUi.triggerChip"
                  :style="{ backgroundColor: modelValue }"
                />
                <UIcon
                  v-else
                  :name="props.icon"
                  :class="extraUi.triggerIcon"
                />
              </slot>
            </template>
            <template v-if="!!slots.trailing" #trailing>
              <slot name="trailing" :value="modelValue" />
            </template>
          </UInput>
        </div>

        <UButton
          v-else
          :id="id"
          :name="name"
          v-bind="{ ...triggerButtonAttrs, ...ariaAttrs }"
          @blur="emitFormBlur"
          @focus="emitFormFocus"
        >
          <template #leading>
            <slot name="leading" :value="modelValue">
              <span v-if="modelValue" :class="extraUi.triggerChip" :style="{ backgroundColor: modelValue }" />
              <UIcon v-else :name="props.icon" />
            </slot>
          </template>
          <span :class="extraUi.triggerLabel">{{ triggerLabel }}</span>
          <template v-if="!!slots.trailing" #trailing>
            <slot name="trailing" :value="modelValue" />
          </template>
        </UButton>
      </slot>
    </template>

    <template #content>
      <div :class="extraUi.body">
        <div v-if="showFormatTabs" :class="extraUi.header">
          <PillGroup
            :model-value="currentFormat"
            :items="formatItems"
            value-key="value"
            size="xs"
            color="neutral"
            @update:model-value="(v) => selectFormat(v as ColorFormat)"
          />
        </div>

        <UColorPicker
          :model-value="modelValue ?? '#000000'"
          v-bind="colorPickerAttrs"
          @update:model-value="handlePickerUpdate"
        />

        <div v-if="hasSwatches || !!slots.swatches" :class="extraUi.section">
          <slot name="swatches" :swatches="swatchRows" :select="selectSwatch">
            <div v-for="(row, idx) in swatchRows" :key="idx" :class="extraUi.swatches">
              <button
                v-for="c in row"
                :key="c"
                type="button"
                :aria-selected="modelValue === c"
                :aria-label="c"
                :class="extraUi.swatch"
                :style="{ backgroundColor: c }"
                @click="selectSwatch(c)"
              />
            </div>
          </slot>
        </div>

        <div v-if="props.copyable || props.clearable || !!slots.actions" :class="extraUi.actions">
          <slot name="actions" :value="modelValue" :copy="handleCopy" :clear="handleClear">
            <span :class="extraUi.actionsValue">
              {{ modelValue || '—' }}
            </span>
            <div :class="extraUi.actionsButtons">
              <UButton
                v-if="props.copyable"
                icon="i-lucide-copy"
                size="xs"
                color="neutral"
                variant="ghost"
                :disabled="!modelValue"
                @click="handleCopy"
              />
              <UButton
                v-if="props.clearable"
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                :disabled="!modelValue"
                @click="handleClear"
              />
            </div>
          </slot>
        </div>
      </div>
    </template>
  </UPopover>
</template>
