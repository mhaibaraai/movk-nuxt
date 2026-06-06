<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const appConfig = useAppConfig()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const items = computed<DropdownMenuItem[]>(() => [{
  label: 'Primary',
  chip: appConfig.ui.colors.primary,
  children: colors.map(color => ({
    label: color,
    chip: color,
    type: 'checkbox' as const,
    checked: appConfig.ui.colors.primary === color,
    onSelect: (e: Event) => {
      e.preventDefault()
      appConfig.ui.colors.primary = color
    }
  }))
}, {
  label: 'Neutral',
  chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
  children: neutrals.map(color => ({
    label: color,
    chip: color === 'neutral' ? 'old-neutral' : color,
    type: 'checkbox' as const,
    checked: appConfig.ui.colors.neutral === color,
    onSelect: (e: Event) => {
      e.preventDefault()
      appConfig.ui.colors.neutral = color
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
      class="data-[state=open]:bg-elevated"
      aria-label="Switch theme"
    />
    <template #item-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          :style="{
            '--chip-light': `var(--color-${(item as { chip: string }).chip}-500)`,
            '--chip-dark': `var(--color-${(item as { chip: string }).chip}-400)`
          }"
          class="size-2 rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark)"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
