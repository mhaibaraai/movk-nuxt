<script lang="ts" setup generic="T extends PillItem, VK extends GetItemKeys<T> = 'value', M extends boolean = false">
import type { AcceptableValue, ComponentConfig, GetItemKeys, GetModelValue } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { computed, ref } from 'vue'
import { FieldGroupReset } from '@nuxt/ui/composables/useFieldGroup'
import { UButton } from '#components'
import { useAppConfig } from '#imports'
import { createEqualsBy, getPath } from '@movk/core'
import theme from '#build/movk-ui/pill-group'
import { useExtendedTv } from '../utils/extend-theme'
import { useFieldControl } from '../utils/form-control'
import type {
  PillGroupProps,
  PillGroupEmits,
  PillGroupSlots,
  PillItem,
  PillGroupValue
} from '../types/components/pill-group'

type PillGroup = ComponentConfig<typeof theme, AppConfig, 'pillGroup'>

interface _Props extends PillGroupProps<T, VK, M> {
  orientation?: PillGroup['variants']['orientation']
  ui?: PillGroup['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  orientation: 'horizontal',
  activeVariant: 'solid',
  inactiveVariant: 'soft',
  labelKey: 'label',
  descriptionKey: 'description'
})

const modelValue = defineModel<GetModelValue<T, VK, M>>()
const emits = defineEmits<PillGroupEmits<T, VK, M>>()
const slots = defineSlots<PillGroupSlots<T, VK, M>>()

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
      fieldGroup: fieldGroupOrientation.value
    }
  })
)

function isSelectItem(item: PillItem): item is Exclude<PillItem, PillGroupValue> {
  return typeof item === 'object' && item !== null
}

function getItemValue(item: PillItem): PillItem {
  if (!isSelectItem(item)) return item
  if (!props.valueKey) return item
  return getPath(item, props.valueKey) as AcceptableValue
}

function getItemKey(item: PillItem, idx: number): string | number {
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

function getItemLabel(item: PillItem): string {
  if (!isSelectItem(item)) return String(item)
  const label = getPath(item, props.labelKey ?? 'label') as string | undefined
  if (label != null) return String(label)
  const value = getPath(item, 'value')
  return value != null ? String(value) : ''
}

function getItemDescription(item: PillItem): string | undefined {
  if (!isSelectItem(item)) return undefined
  const desc = getPath(item, props.descriptionKey ?? 'description')
  return desc == null ? undefined : String(desc)
}

const itemEquals = computed(() => createEqualsBy<PillItem>({
  by: props.by as string | ((a: PillItem, b: PillItem) => boolean) | undefined,
  keys: [props.valueKey, 'value', props.labelKey ?? 'label']
}))

const selectedArray = computed<PillItem[]>(() => {
  if (!props.multiple) return []
  const v = modelValue.value
  return Array.isArray(v) ? v : []
})

// 多选 + by 为字符串时启用 O(1) 命中
const selectedKeyMap = computed<Map<AcceptableValue, true> | null>(() => {
  if (!props.multiple || !props.by || typeof props.by !== 'string') return null
  const m = new Map<AcceptableValue, true>()
  for (const v of selectedArray.value) {
    const key = isSelectItem(v) ? getPath(v, props.by) as AcceptableValue : v
    m.set(key, true)
  }
  return m
})

function isSelected(item: PillItem): boolean {
  const target = getItemValue(item)
  if (props.multiple) {
    if (selectedKeyMap.value) {
      const key = isSelectItem(target) ? getPath(target, props.by as string) as AcceptableValue : target
      return selectedKeyMap.value.has(key)
    }
    return selectedArray.value.some(v => itemEquals.value(v, target))
  }
  if (modelValue.value === undefined) return false
  return itemEquals.value(modelValue.value as PillItem, target)
}

function isItemDisabled(item: PillItem): boolean {
  return isSelectItem(item) && item.disabled === true
}

const reachedMax = computed<boolean>(() =>
  !!(props.multiple && props.max != null && selectedArray.value.length >= props.max)
)

// 视觉锁：max 触顶，未选项变灰
function isItemLocked(item: PillItem): boolean {
  return reachedMax.value && !isSelected(item)
}

// 交互锁：min 阻止取消，视觉不变
function isClickBlocked(item: PillItem): boolean {
  if (!props.multiple || props.min == null) return false
  return isSelected(item) && selectedArray.value.length <= props.min
}

function emitSelect(item: PillItem, index: number, selected: boolean) {
  emits('select', {
    item: item as T,
    value: getItemValue(item) as PillGroupValue | T,
    selected,
    index
  })
}

function handleClick(e: Event, item: PillItem, index: number) {
  if (effectiveDisabled.value || isItemDisabled(item)) return
  if (props.multiple && (isItemLocked(item) || isClickBlocked(item))) return
  if (isSelectItem(item) && typeof item.onSelect === 'function') {
    item.onSelect(e)
  }

  if (props.multiple) {
    const arr = selectedArray.value
    const target = getItemValue(item)
    const wasSelected = isSelected(item)
    const next = wasSelected
      ? arr.filter(v => !itemEquals.value(v, target))
      : [...arr, target]
    modelValue.value = next as never
    emits('change', next as never)
    emitSelect(item, index, !wasSelected)
  } else {
    const next = getItemValue(item)
    const wasSelected = isSelected(item)
    const finalValue = props.deselectable && wasSelected ? undefined : next
    if (itemEquals.value(modelValue.value as PillItem, finalValue as PillItem)) return
    modelValue.value = finalValue as never
    emits('change', finalValue as never)
    emitSelect(item, index, !wasSelected)
  }
  emitFormChange()
  emitFormInput()
}

function isDisabledItem(item: PillItem): boolean {
  return effectiveDisabled.value
    || isItemDisabled(item)
    || isItemLocked(item)
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

function hasLeading(item: PillItem): boolean {
  return isSelectItem(item) && (!!item.icon || !!item.avatar)
}
</script>

<template>
  <div :class="extendUi.root" data-slot="root">
    <FieldGroupReset>
      <slot name="leading" :model-value="modelValue" :items="items ?? []" />

      <slot :model-value="modelValue" :items="items ?? []">
        <div
          :id="id"
          :role="props.multiple ? 'group' : undefined"
          :class="extendUi.list"
          data-slot="list"
          v-bind="ariaAttrs"
          @focusin="handleFocusIn"
          @focusout="handleFocusOut"
        >
          <template v-for="(item, idx) in items" :key="getItemKey(item, idx)">
            <slot
              name="item"
              :item="item"
              :index="idx"
              :selected="isSelected(item)"
            >
              <UButton
                :color="isSelectItem(item) && item.color ? item.color : effectiveColor"
                :size="effectiveSize"
                :disabled="isDisabledItem(item)"
                :variant="isSelected(item)
                  ? (isSelectItem(item) && item.variant ? item.variant : props.activeVariant)
                  : props.inactiveVariant"
                :class="[extendUi.item, isSelectItem(item) ? item.class : undefined]"
                @click="handleClick($event, item, idx)"
              >
                <span
                  v-if="!!slots['item-leading'] || hasLeading(item)"
                  :class="extendUi.leading"
                  data-slot="leading"
                >
                  <slot
                    name="item-leading"
                    :item="item"
                    :index="idx"
                    :selected="isSelected(item)"
                  >
                    <UIcon
                      v-if="isSelectItem(item) && item.icon"
                      :name="item.icon"
                      :class="extendUi.leadingIcon"
                    />
                    <UAvatar
                      v-else-if="isSelectItem(item) && item.avatar"
                      v-bind="item.avatar"
                    />
                  </slot>
                </span>

                <span :class="extendUi.itemWrapper">
                  <span :class="extendUi.itemLabel">
                    <slot
                      name="item-label"
                      :item="item"
                      :index="idx"
                      :selected="isSelected(item)"
                    >
                      {{ getItemLabel(item) }}
                    </slot>
                  </span>
                  <span
                    v-if="getItemDescription(item) || !!slots['item-description']"
                    :class="extendUi.itemDescription"
                  >
                    <slot
                      name="item-description"
                      :item="item"
                      :index="idx"
                      :selected="isSelected(item)"
                    >
                      {{ getItemDescription(item) }}
                    </slot>
                  </span>
                </span>

                <span
                  v-if="!!slots['item-trailing']"
                  :class="extendUi.trailing"
                  data-slot="trailing"
                >
                  <slot
                    name="item-trailing"
                    :item="item"
                    :index="idx"
                    :selected="isSelected(item)"
                  />
                </span>
              </UButton>
            </slot>
          </template>
        </div>
      </slot>

      <slot name="trailing" :model-value="modelValue" :items="items ?? []" />
    </FieldGroupReset>
  </div>
</template>
