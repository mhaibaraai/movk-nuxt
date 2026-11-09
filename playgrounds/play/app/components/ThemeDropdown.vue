<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { primary, neutral, primaryColors, neutralColors } = useTheme()

// 未选择时沿用 @nuxt/ui v5 的默认色板
const items = computed<DropdownMenuItem[]>(() => [{
  label: 'Primary',
  chip: primary.value ?? 'sky',
  children: primaryColors.map(color => ({
    label: color,
    chip: color,
    type: 'checkbox' as const,
    checked: primary.value === color,
    onSelect: (e: Event) => {
      e.preventDefault()
      primary.value = color
    }
  }))
}, {
  label: 'Neutral',
  chip: neutral.value ?? 'gray',
  children: neutralColors.map(color => ({
    label: color,
    chip: color,
    type: 'checkbox' as const,
    checked: neutral.value === color,
    onSelect: (e: Event) => {
      e.preventDefault()
      neutral.value = color
    }
  }))
}])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ side: 'right', align: 'start' }">
    <UButton
      icon="i-lucide-swatch-book"
      color="neutral"
      variant="ghost"
      size="sm"
      class="data-[state=open]:bg-soft"
      aria-label="Switch theme"
    />
    <template #item-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          :style="{
            '--chip-light': `var(--color-${(item as { chip: string }).chip}-500)`,
            '--chip-dark': `var(--color-${(item as { chip: string }).chip}-400)`
          }"
          class="size-2 rounded-full ring ring-(--ui-bg-default) bg-(--chip-light) dark:bg-(--chip-dark)"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
