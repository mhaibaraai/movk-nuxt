<script lang="ts" setup generic="T extends Record<string, any> = PillsItem, VK extends keyof T & string | undefined = undefined">
import type { AcceptableValue, ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { computed, ref } from 'vue'
import type { AcceptableValue as RekaAcceptableValue } from 'reka-ui'
import { ToggleGroupRoot, ToggleGroupItem } from 'reka-ui'
import { FieldGroupReset } from '@nuxt/ui/composables/useFieldGroup'
import { UBadge, UButton } from '#components'
import { useAppConfig } from '#imports'
import { getPath } from '@movk/core'
import theme from '#build/movk-ui/pill-group'
import { useExtendedTv } from '../utils/extend-theme'
import { useFieldControl } from '../utils/form-control'
import type {
  PillGroupProps,
  PillGroupEmits,
  PillGroupSlots,
  PillsItem
} from '../types/components/pill-group'

type PillGroup = ComponentConfig<typeof theme, AppConfig, 'pillGroup'>

interface _Props extends PillGroupProps<T, VK> {
  orientation?: PillGroup['variants']['orientation']
  size?: PillGroup['variants']['size']
  ui?: PillGroup['slots']
  multiple?: boolean
  /** 单选: 再次点击当前选中项清空 */
  deselectable?: boolean
  /** 多选: 最多可选数量 */
  max?: number
  /** 多选: 最少需保留数量 */
  min?: number
}

const props = withDefaults(defineProps<_Props>(), {
  orientation: 'horizontal',
  activeVariant: 'solid',
  inactiveVariant: 'soft',
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
  size: effectiveSize,
  color: effectiveColor,
  disabled: effectiveDisabled,
  fieldGroupOrientation,
  ariaAttrs,
  emitFormChange,
  emitFormFocus,
  emitFormBlur,
  emitFormInput
} = useFieldControl(props)

const focusWithin = ref(false)

const { extendUi } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.pillGroup,
  () => ({
    ui: {
      ...props.ui,
      root: [props.ui?.root, props.class]
    },
    variants: {
      orientation: props.orientation,
      size: effectiveSize.value,
      disabled: effectiveDisabled.value,
      fieldGroup: fieldGroupOrientation.value
    }
  })
)

function isSelectItem(item: unknown): item is T {
  return typeof item === 'object' && item !== null
}

// 统一的 key 生成器: item 与 modelValue 共用同一套规则,reka-ui 内部 O(1) 比较
function keyOf(input: unknown, idx?: number): string {
  if (input == null) return idx != null ? `i:${idx}` : ''
  if (typeof input !== 'object') return `v:${String(input)}`
  const obj = input as Record<string, any>
  if (props.by && typeof props.by === 'string') {
    const v = getPath(obj, props.by)
    if (v != null && typeof v !== 'object') return `v:${String(v)}`
  }
  if (props.valueKey) {
    const v = getPath(obj, props.valueKey)
    if (v != null && typeof v !== 'object') return `v:${String(v)}`
  }
  const valueField = getPath(obj, 'value')
  if (valueField != null && typeof valueField !== 'object') return `v:${String(valueField)}`
  const label = getPath(obj, props.labelKey ?? 'label') as string | undefined
  if (label) return `l:${label}`
  return idx != null ? `i:${idx}` : ''
}

const keyToItem = computed(() => {
  const m = new Map<string, AcceptableValue | T>()
  ;(props.items ?? []).forEach((it, i) => m.set(keyOf(it, i), it))
  return m
})

const internalValue = computed<string | string[] | undefined>(() => {
  const mv = modelValue.value
  if (props.multiple) return Array.isArray(mv) ? mv.map(v => keyOf(v)) : []
  return mv == null ? undefined : keyOf(mv)
})

function isSelected(item: AcceptableValue | T, idx: number): boolean {
  const k = keyOf(item, idx)
  const v = internalValue.value
  return Array.isArray(v) ? v.includes(k) : v === k
}

function isItemLocked(item: AcceptableValue | T, idx: number): boolean {
  if (!props.multiple || props.max == null) return false
  const v = internalValue.value
  return Array.isArray(v) && v.length >= props.max && !v.includes(keyOf(item, idx))
}

function isItemDisabled(item: AcceptableValue | T): boolean {
  return isSelectItem(item) && item.disabled === true
}

function getItemValue(item: AcceptableValue | T): AcceptableValue | T {
  if (!isSelectItem(item) || !props.valueKey) return item
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
  return isSelectItem(item)
    ? (getPath(item, props.descriptionKey ?? 'description') as string | undefined)
    : undefined
}

function onUpdate(next: RekaAcceptableValue | RekaAcceptableValue[]) {
  if (props.multiple) {
    const arrKeys = (Array.isArray(next) ? next : []) as string[]
    if (props.min != null && arrKeys.length < props.min) return
    const prev = (internalValue.value as string[]) ?? []
    const addedKey = arrKeys.find(k => !prev.includes(k))
    if (addedKey) {
      const it = keyToItem.value.get(addedKey)
      if (isSelectItem(it) && typeof it.onSelect === 'function') it.onSelect(new Event('select'))
    }
    const values = arrKeys.map(k => getItemValue(keyToItem.value.get(k)!))
    modelValue.value = values as SingleValue[]
    emits('change', values as (AcceptableValue | Record<string, any>)[])
  } else {
    if (next == null && !props.deselectable) return
    const it = next ? keyToItem.value.get(next as string) : undefined
    if (it && isSelectItem(it) && typeof it.onSelect === 'function') it.onSelect(new Event('select'))
    const v = it ? getItemValue(it) : undefined
    modelValue.value = v as SingleValue | undefined
    emits('change', v as AcceptableValue | Record<string, any> | undefined)
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
</script>

<template>
  <div :class="extendUi.root" data-slot="root" @focusin="handleFocusIn" @focusout="handleFocusOut">
    <FieldGroupReset>
      <ToggleGroupRoot
        :id="id"
        :type="multiple ? 'multiple' : 'single'"
        :model-value="internalValue"
        :disabled="effectiveDisabled"
        :orientation="orientation"
        :roving-focus="true"
        :loop="true"
        :class="extendUi.list"
        v-bind="ariaAttrs"
        @update:model-value="onUpdate"
      >
        <ToggleGroupItem
          v-for="(item, idx) in items"
          :key="keyOf(item, idx)"
          :value="keyOf(item, idx)"
          :disabled="isItemDisabled(item) || isItemLocked(item, idx)"
          as-child
        >
          <UButton
            :color="effectiveColor"
            :variant="isSelected(item, idx) ? activeVariant : inactiveVariant"
            :size="effectiveSize"
            :icon="isSelectItem(item) ? item.icon : undefined"
            :avatar="isSelectItem(item) ? item.avatar : undefined"
            :class="[extendUi.item, isSelectItem(item) ? item.class : undefined]"
          >
            <template v-if="!!slots.leading" #leading>
              <slot
                name="leading"
                :item="item"
                :index="idx"
                :selected="isSelected(item, idx)"
              />
            </template>

            <span :class="extendUi.wrapper">
              <span :class="extendUi.label">
                <slot
                  name="label"
                  :item="item"
                  :index="idx"
                  :selected="isSelected(item, idx)"
                >
                  {{ getItemLabel(item) }}
                </slot>
              </span>
              <span
                v-if="getItemDescription(item) || !!slots.description"
                :class="extendUi.description"
              >
                <slot
                  name="description"
                  :item="item"
                  :index="idx"
                  :selected="isSelected(item, idx)"
                >
                  {{ getItemDescription(item) }}
                </slot>
              </span>
            </span>

            <template
              v-if="!!slots.trailing || (isSelectItem(item) && item.badge != null)"
              #trailing
            >
              <slot
                name="trailing"
                :item="item"
                :index="idx"
                :selected="isSelected(item, idx)"
              >
                <UBadge
                  v-if="isSelectItem(item) && item.badge != null"
                  size="xs"
                  v-bind="typeof item.badge === 'object' ? item.badge : { label: String(item.badge) }"
                />
              </slot>
            </template>
          </UButton>
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </FieldGroupReset>
  </div>
</template>
