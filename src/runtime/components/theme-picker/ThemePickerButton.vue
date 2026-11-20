<script lang="ts">
interface ThemePickerButtonProps {
  label: string
  icon?: string
  chip?: string
  selected?: boolean
}

interface ThemePickerButtonSlots {
  leading: () => any
}
</script>

<script lang="ts" setup>
import { useAppConfig } from '#imports'
import { computed } from 'vue'
import { resolveSwatchColor } from '../../domains/theme/theme-color'

const props = defineProps<ThemePickerButtonProps>()
const slots = defineSlots<ThemePickerButtonSlots>()
const appConfig = useAppConfig()

const chipStyle = computed(() => {
  if (!props.chip) return
  const ui = appConfig.ui
  const prefix = ui && 'prefix' in ui && typeof ui.prefix === 'string' ? ui.prefix : undefined
  return {
    '--color-light': resolveSwatchColor(props.chip, 500, prefix),
    '--color-dark': resolveSwatchColor(props.chip, 400, prefix)
  }
})
</script>

<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="capitalize ring-default rounded-sm text-[11px]"
    :class="selected ? 'bg-elevated' : 'hover:bg-elevated/50'"
  >
    <template v-if="chip || !!slots.leading" #leading>
      <slot name="leading">
        <span
          class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="chipStyle"
        />
      </slot>
    </template>
  </UButton>
</template>
