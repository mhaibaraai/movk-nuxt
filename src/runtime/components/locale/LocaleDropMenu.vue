<script lang="ts" setup>
import type { ButtonProps, DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { smartT } from '../../utils/t'

type LocaleItem = DropdownMenuItem & {
  code: string
  name?: string
}

export interface LocaleDropMenuProps {
  /**
   * 按钮中显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-languages'
   */
  icon?: string
  locales?: LocaleItem[]
  size?: ButtonProps['size']
  /**
   * 按钮的颜色
   * @defaultValue 'neutral'
   */
  color?: ButtonProps['color']
  /**
   * 按钮的变体
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps['variant']
  disabled?: boolean
  ui?: ButtonProps['ui']
}

defineOptions({ inheritAttrs: false })
const {
  locales = [],
  icon = 'i-lucide-languages',
  variant = 'ghost',
  color = 'neutral',
  ...rest
} = defineProps<LocaleDropMenuProps>()
const modelValue = defineModel<string>()

const items = computed(() =>
  locales.map(l => ({
    ...l,
    type: 'checkbox',
    checked: modelValue.value === l.code,
    onSelect: (e: Event) => {
      e.preventDefault()
      modelValue.value = l.code
    },
  } satisfies DropdownMenuItem)),
)
</script>

<template>
  <UDropdownMenu
    :items="items"
    arrow
    label-key="name"
    :ui="{ content: 'w-24' }"
  >
    <UButton
      :aria-label="`${smartT('common.switchTo')}${modelValue}`"
      :icon="icon"
      v-bind="{ color, variant, ...rest }"
    />
  </UDropdownMenu>
</template>
