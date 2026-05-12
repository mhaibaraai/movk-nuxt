<script lang="ts" setup generic="T extends Record<string, any> = PillsItem, VK extends keyof T & string | undefined = undefined">
import type { AcceptableValue, ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { computed, ref, toRaw } from 'vue'
import { UAvatar, UBadge, UButton, UIcon } from '#components'
import { useAppConfig } from '#imports'
import { useFieldGroup } from '@nuxt/ui/composables/useFieldGroup'
import { useFormField } from '@nuxt/ui/composables/useFormField'
import { getPath } from '@movk/core'
import theme from '#build/movk-ui/pill-group'
import { useExtendedTv } from '../utils/extend-theme'
import type {
  PillGroupProps,
  PillGroupEmits,
  PillGroupSlots,
  PillsItem,
  PillsModelValue
} from '../types/components/pill-group'

interface _Props extends PillGroupProps<T, VK> {
  size?: ComponentConfig<typeof theme, AppConfig, 'pillGroup'>['variants']['size']
  orientation?: ComponentConfig<typeof theme, AppConfig, 'pillGroup'>['variants']['orientation']
  ui?: ComponentConfig<typeof theme, AppConfig, 'pillGroup'>['slots']
  multiple?: boolean
  /** 单选: 再次点击当前选中项清空 */
  deselectable?: boolean
  /** 多选: 最多可选数量 */
  max?: number
  /** 多选: 最少需保留数量 */
  min?: number
}

const props = withDefaults(defineProps<_Props>(), {
  variant: 'solid',
  inactiveVariant: 'ghost',
  labelKey: 'label',
  descriptionKey: 'description'
})

type SingleValue = PillsModelValue<T, VK>
const modelValue = defineModel<SingleValue | SingleValue[] | undefined>()
const emits = defineEmits<PillGroupEmits>()
const slots = defineSlots<PillGroupSlots<T>>()

const appConfig = useAppConfig() as { movk?: { pillGroup?: unknown } }

const {
  id,
  size: ffSize,
  color: ffColor,
  disabled: ffDisabled,
  ariaAttrs,
  emitFormChange,
  emitFormFocus,
  emitFormBlur,
  emitFormInput
} = useFormField<_Props>(props)
const { size: fieldGroupSize } = useFieldGroup<_Props>(props)

const effectiveSize = computed(() => fieldGroupSize.value || ffSize.value)
const effectiveColor = computed(() => ffColor.value ?? props.color)
const effectiveDisabled = computed(() => ffDisabled.value ?? props.disabled ?? false)
const focusWithin = ref(false)

const { extendUi } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.pillGroup,
  () => ({
    ui: props.ui,
    variants: {
      orientation: props.orientation,
      size: effectiveSize.value,
      disabled: effectiveDisabled.value
    }
  })
)

function isSelectItem(item: unknown): item is T {
  return typeof item === 'object' && item !== null
}

function getItemValue(item: AcceptableValue | T): AcceptableValue | T {
  if (!isSelectItem(item)) return item
  if (!props.valueKey) return item
  return getPath(item, props.valueKey) as AcceptableValue
}

function getItemLabel(item: AcceptableValue | T): string {
  if (!isSelectItem(item)) return String(item)
  const label = getPath(item, props.labelKey ?? 'label') as string | undefined
  if (label != null) return label
  const value = getItemValue(item)
  return isSelectItem(value) ? '' : String(value)
}

function getItemDescription(item: AcceptableValue | T): string | undefined {
  if (!isSelectItem(item)) return undefined
  return getPath(item, props.descriptionKey ?? 'description') as string | undefined
}

function getItemKey(item: AcceptableValue | T, idx: number): string | number {
  if (!isSelectItem(item)) return `v:${String(item)}`
  if (props.valueKey) {
    const v = getPath(item, props.valueKey)
    if (v != null && typeof v !== 'object') return `v:${String(v)}`
  }
  const valueField = getPath(item, 'value')
  if (valueField != null && typeof valueField !== 'object') return `v:${String(valueField)}`
  const label = getPath(item, props.labelKey ?? 'label') as string | undefined
  if (label) return `l:${label}`
  return `i:${idx}`
}

function isItemDisabled(item: AcceptableValue | T): boolean {
  return isSelectItem(item) && item.disabled === true
}

function compareItem(a: unknown, b: unknown): boolean {
  const ra = a !== null && typeof a === 'object' ? toRaw(a) : a
  const rb = b !== null && typeof b === 'object' ? toRaw(b) : b
  if (ra === rb) return true
  if (props.by) {
    if (typeof props.by === 'function' && isSelectItem(ra) && isSelectItem(rb)) {
      return props.by(ra as T, rb as T)
    }
    if (typeof props.by === 'string' && isSelectItem(ra) && isSelectItem(rb)) {
      return getPath(ra, props.by) === getPath(rb, props.by)
    }
  }
  return false
}

const selectedArray = computed<unknown[]>(() => {
  if (!props.multiple) return []
  const v = modelValue.value
  return Array.isArray(v) ? v : []
})

// 多选 + by 为字符串时启用 O(1) 命中
const selectedKeyMap = computed<Map<unknown, true> | null>(() => {
  if (!props.multiple || !props.by || typeof props.by !== 'string') return null
  const m = new Map<unknown, true>()
  for (const v of selectedArray.value) {
    const key = isSelectItem(v) ? getPath(v, props.by) : v
    m.set(key, true)
  }
  return m
})

function isSelected(item: AcceptableValue | T): boolean {
  const target = getItemValue(item)
  if (props.multiple) {
    if (selectedKeyMap.value) {
      const key = isSelectItem(target) ? getPath(target, props.by as string) : target
      return selectedKeyMap.value.has(key)
    }
    return selectedArray.value.some(v => compareItem(v, target))
  }
  if (modelValue.value === undefined) return false
  return compareItem(modelValue.value, target)
}

const reachedMax = computed(() =>
  props.multiple && props.max != null && selectedArray.value.length >= props.max
)

// 视觉锁: max 触顶,未选项变灰
function isItemLocked(item: AcceptableValue | T): boolean {
  return reachedMax.value && !isSelected(item)
}

// 交互锁: min 阻止取消,视觉不变
function isClickBlocked(item: AcceptableValue | T): boolean {
  if (!props.multiple || props.min == null) return false
  return isSelected(item) && selectedArray.value.length <= props.min
}

function handleClick(e: Event, item: AcceptableValue | T) {
  if (effectiveDisabled.value || isItemDisabled(item)) return
  if (props.multiple && (isItemLocked(item) || isClickBlocked(item))) return
  if (isSelectItem(item) && typeof item.onSelect === 'function') {
    item.onSelect(e)
  }

  if (props.multiple) {
    const arr = selectedArray.value
    const target = getItemValue(item)
    const next = isSelected(item)
      ? arr.filter(v => !compareItem(v, target))
      : [...arr, target]
    modelValue.value = next as SingleValue[]
    emits('change', next as (AcceptableValue | Record<string, any>)[])
  } else {
    const next = getItemValue(item)
    const isCurrent = isSelected(item)
    const finalValue = props.deselectable && isCurrent ? undefined : next
    if (compareItem(modelValue.value, finalValue)) return
    modelValue.value = finalValue as SingleValue | undefined
    emits('change', finalValue as AcceptableValue | Record<string, any> | undefined)
  }
  emitFormChange()
  emitFormInput()
}

function handleFocusIn() {
  if (focusWithin.value) return
  focusWithin.value = true
  emitFormFocus()
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && (event.currentTarget as HTMLElement).contains(nextTarget)) return
  focusWithin.value = false
  emitFormBlur()
}

function hasLeading(item: AcceptableValue | T): boolean {
  return isSelectItem(item) && (!!item.icon || !!item.avatar)
}

function hasTrailing(item: AcceptableValue | T): boolean {
  return isSelectItem(item) && item.badge != null
}

const groupRole = computed(() => (props.multiple ? 'group' : 'radiogroup'))
const itemRole = computed(() => (props.multiple ? 'checkbox' : 'radio'))
</script>

<template>
  <div :class="extendUi.root">
    <div
      :id="id"
      :name="name"
      :role="groupRole"
      :class="extendUi.list"
      v-bind="ariaAttrs"
      :aria-required="props.required || undefined"
      @focusin="handleFocusIn"
      @focusout="handleFocusOut"
    >
      <UButton
        v-for="(item, idx) in items"
        :key="getItemKey(item, idx)"
        :color="effectiveColor"
        :variant="isSelected(item) ? props.variant : props.inactiveVariant"
        :size="effectiveSize"
        :disabled="effectiveDisabled || isItemDisabled(item) || isItemLocked(item)"
        :class="[extendUi.item, isSelectItem(item) ? item.class : undefined]"
        :role="itemRole"
        :aria-checked="isSelected(item)"
        @click="handleClick($event, item)"
      >
        <template v-if="!!slots.leading || hasLeading(item)" #leading>
          <slot
            name="leading"
            :item="item"
            :index="idx"
            :selected="isSelected(item)"
          >
            <UIcon v-if="isSelectItem(item) && item.icon" :name="item.icon" />
            <UAvatar v-else-if="isSelectItem(item) && item.avatar" v-bind="item.avatar" />
          </slot>
        </template>

        <span :class="extendUi.itemBody">
          <span :class="extendUi.itemLabel">
            <slot
              name="label"
              :item="item"
              :index="idx"
              :selected="isSelected(item)"
            >
              {{ getItemLabel(item) }}
            </slot>
          </span>
          <span
            v-if="getItemDescription(item) || !!slots.description"
            :class="extendUi.itemDescription"
          >
            <slot
              name="description"
              :item="item"
              :index="idx"
              :selected="isSelected(item)"
            >
              {{ getItemDescription(item) }}
            </slot>
          </span>
        </span>

        <template v-if="!!slots.trailing || hasTrailing(item)" #trailing>
          <slot
            name="trailing"
            :item="item"
            :index="idx"
            :selected="isSelected(item)"
          >
            <UBadge
              v-if="isSelectItem(item) && item.badge != null"
              size="xs"
              v-bind="typeof item.badge === 'object' ? item.badge : { label: String(item.badge) }"
            />
          </slot>
        </template>
      </UButton>
    </div>
  </div>
</template>
