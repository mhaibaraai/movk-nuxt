<script lang="ts" setup>
import type { SwitchProps } from '@nuxt/ui'
import { useColorMode } from '#imports'
import { computed } from 'vue'

export interface ColorModeSwitchProps {
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
   * 开关的颜色
   */
  color?: SwitchProps['color']
  size?: SwitchProps['size']
  disabled?: boolean
  ui?: SwitchProps['ui']
}

defineOptions({ inheritAttrs: false })
const {
  darkIcon = 'i-lucide-moon',
  lightIcon = 'i-lucide-sun',
  ...rest
} = defineProps<ColorModeSwitchProps>()
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
    <USwitch
      v-model="isDark"
      :checked-icon="darkIcon"
      :unchecked-icon="lightIcon"
      v-bind="rest"
    />

    <template #fallback>
      <USwitch
        :checked-icon="darkIcon"
        :unchecked-icon="lightIcon"
        v-bind="rest"
        disabled
      />
    </template>
  </ClientOnly>
</template>
