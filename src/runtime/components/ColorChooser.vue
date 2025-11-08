<script setup lang="ts" generic="P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UColorPicker, UIcon } from '#components'
import type { ButtonProps, PopoverProps, ColorPickerProps, PopoverEmits } from '@nuxt/ui'
import { computed } from 'vue'

interface ColorChooserProps extends /** @vue-ignore */ ColorPickerProps {
  popoverProps?: PopoverProps<P>
  buttonProps?: ButtonProps
}

type ColorChooserEmits = PopoverEmits

const {
  buttonProps = { label: '选择颜色' },
  popoverProps
} = defineProps<ColorChooserProps>()

const emit = defineEmits<ColorChooserEmits>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<string>()

const chipStyle = computed(() => ({
  backgroundColor: modelValue.value || ''
}))
</script>

<template>
  <UPopover v-bind="popoverProps" @close:prevent="emit('close:prevent')" @update:open="emit('update:open', $event)">
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          :label="modelValue"
          color="neutral"
          variant="subtle"
          class="w-full"
          v-bind="buttonProps"
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
