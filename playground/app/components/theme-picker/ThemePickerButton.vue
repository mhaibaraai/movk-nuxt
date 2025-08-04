<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  chip?: string
  selected?: boolean
}>()

const slots = defineSlots<{
  leading: () => any
}>()
</script>

<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="ring-default text-[11px] rounded-sm capitalize"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template
      v-if="chip || !!slots.leading"
      #leading
    >
      <slot name="leading">
        <span
          class="rounded-full bg-[var(--color-light)] size-2 inline-block dark:bg-[var(--color-dark)]"
          :style="{
            '--color-light': `var(--color-${chip}-500)`,
            '--color-dark': `var(--color-${chip}-400)`,
          }"
        />
      </slot>
    </template>
  </UButton>
</template>
