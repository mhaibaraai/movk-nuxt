<script setup lang="ts">
import type { IconProps } from '@nuxt/ui'
import type { SemanticColor } from '@movk/nuxt'

defineProps<{
  type: SemanticColor
  icon: IconProps['name']
}>()

const open = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton :color="type" variant="soft" label="自定义图标" :icon @click="open = true" />

    <MMessageBox
      v-model:open="open"
      :type
      :icon
      title="安全警告"
      description="使用 icon 属性可覆盖默认图标，自定义与业务场景匹配的视觉提示。"
    />
  </div>
</template>
