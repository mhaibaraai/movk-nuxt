<script setup lang="ts" generic="P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UColorPicker, UIcon } from '#components'
import type { ButtonProps, ColorPickerProps, PopoverEmits, PopoverProps } from '@nuxt/ui'
import { computed } from 'vue'

export interface ColorChooserProps<P extends 'click' | 'hover' = 'click'> extends /** @vue-ignore */ ColorPickerProps {
  /** Props for the popover component */
  popoverProps?: PopoverProps<P>
  /** Props for the button component */
  buttonProps?: ButtonProps
}

const props = defineProps<ColorChooserProps<P>>()
const emit = defineEmits<PopoverEmits>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<string>()

const label = computed(() => {
  return modelValue.value || props.buttonProps?.label || '选择颜色'
})

const chipStyle = computed(() => ({
  backgroundColor: modelValue.value || ''
}))
</script>

<template>
  <UPopover v-bind="props.popoverProps" @close:prevent="emit('close:prevent')" @update:open="emit('update:open', $event)">
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          color="neutral"
          variant="subtle"
          class="w-full"
          v-bind="props.buttonProps"
          :label="label"
        >
          <template #leading="leading">
            <slot name="leading" v-bind="leading">
              <span v-if="modelValue" :style="chipStyle" class="size-3 rounded-full" />
              <UIcon v-else name="i-lucide-palette" class="size-3" />
            </slot>
          </template>
          <template v-if="$slots.trailing" #trailing="trailing">
            <slot name="trailing" v-bind="trailing" />
          </template>
        </UButton>
      </slot>
    </template>

    <template v-if="$slots.anchor" #anchor="anchor">
      <slot name="anchor" v-bind="anchor" />
    </template>

    <template #content>
      <UColorPicker v-model="modelValue" class="p-2" v-bind="$attrs" />
    </template>
  </UPopover>
</template>
