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
import { computed } from 'vue'
import colors from 'tailwindcss/colors'

const props = defineProps<ThemePickerButtonProps>()

const slots = defineSlots<ThemePickerButtonSlots>()

// 取色板字面值：v5 下 Tailwind 不一定产出 --color-<palette>-*，neutral 也已不再改名
const chipShades = computed(() => {
  const shades = props.chip ? (colors as unknown as Record<string, Record<number, string> | undefined>)[props.chip] : undefined
  return typeof shades === 'object' ? shades : undefined
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
    :class="selected ? 'bg-soft' : 'hover:bg-tint'"
  >
    <template v-if="chip || !!slots.leading" #leading>
      <slot name="leading">
        <span
          class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"

          :style="{
            '--color-light': chipShades?.[500],
            '--color-dark': chipShades?.[400]
          }"
        />
      </slot>
    </template>
  </UButton>
</template>
