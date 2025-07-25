<script lang="ts" setup>
import type { SelectMenuProps } from '@nuxt/ui'
import { useColorMode } from '#imports'
import { computed } from 'vue'
import { smartT } from '../../utils/t'

export interface ColorModeSelectProps {
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
   * 系统模式时显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-monitor'
   */
  systemIcon?: string
  trailingIcon?: string
  selectedIcon?: string
  disabled?: boolean
  color?: SelectMenuProps['color']
  size?: SelectMenuProps['size']
  content?: SelectMenuProps['content']
  variant?: SelectMenuProps['variant']
  portal?: SelectMenuProps['portal']
  arrow?: SelectMenuProps['arrow']
  ui?: SelectMenuProps['ui']
}

defineOptions({ inheritAttrs: false })
const {
  darkIcon = 'i-lucide-moon',
  lightIcon = 'i-lucide-sun',
  systemIcon = 'i-lucide-monitor',
  ...rest
} = defineProps<ColorModeSelectProps>()
const colorMode = useColorMode()
const items = computed(() => [
  { label: smartT('colorMode.system'), value: 'system', icon: systemIcon },
  { label: smartT('colorMode.light'), value: 'light', icon: lightIcon },
  { label: smartT('colorMode.dark'), value: 'dark', icon: darkIcon },
])
const preference = computed({
  get() {
    return items.value.find(option => option.value === colorMode.preference) || items.value[0]
  },
  set(option) {
    colorMode.preference = option?.value ?? ''
  },
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <USelectMenu
      v-model="preference"
      :search-input="false"
      :icon="preference?.icon"
      :items="items"
      v-bind="rest"
    />

    <template #fallback>
      <USelectMenu
        :search-input="false"
        :icon="items[0]?.icon"
        :model-value="items[0]"
        :items="items"
        v-bind="rest"
        disabled
      />
    </template>
  </ClientOnly>
</template>
