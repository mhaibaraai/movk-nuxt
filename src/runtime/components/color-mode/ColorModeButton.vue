<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { useColorMode } from '#imports'
import { computed } from 'vue'
import { smartT } from '../../utils/t'

export interface ColorModeButtonProps {
  /**
   * 深色模式时显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-moon'
   */
  darkIcon?: string
  /**
   * 浅色模式时显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-sun'
   */
  lightIcon?: string
  /**
   * 按钮的颜色
   * @defaultValue 'neutral'
   */
  color?: ButtonProps['color']
  size?: ButtonProps['size']
  /**
   * 按钮的变体
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps['variant']
  disabled?: boolean
  ui?: ButtonProps['ui']
}

export interface ColorModeButtonSlots {
  fallback?: (props?: object) => any
}

defineOptions({ inheritAttrs: false })
const {
  darkIcon = 'i-lucide-moon',
  lightIcon = 'i-lucide-sun',
  color = 'neutral',
  variant = 'ghost',
  ...rest
} = defineProps<ColorModeButtonProps>()
defineSlots<ColorModeButtonSlots>()

const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  },
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UButton
      :aria-label="isDark ? smartT('colorMode.switchToLight') : smartT('colorMode.switchToDark')"
      :icon="isDark ? darkIcon : lightIcon"
      v-bind="{ color, variant, ...rest }"
      @click="isDark = !isDark"
    />
    <template #fallback>
      <slot name="fallback">
        <div class="size-8" />
      </slot>
    </template>
  </ClientOnly>
</template>
