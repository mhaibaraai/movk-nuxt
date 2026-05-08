<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  asideLabel?: string
  state?: unknown
}>()

defineSlots<{
  default: () => unknown
  aside: () => unknown
  toolbar: () => unknown
}>()
</script>

<template>
  <section class="flex flex-col gap-3 rounded-lg border border-default bg-default p-4 min-w-0">
    <header v-if="title || $slots.toolbar" class="flex items-start justify-between gap-3">
      <div v-if="title" class="min-w-0">
        <h3 class="text-base font-semibold leading-6">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-sm text-muted">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.toolbar" class="flex items-center gap-2 shrink-0">
        <slot name="toolbar" />
      </div>
    </header>

    <div class="grid gap-4" :class="state !== undefined || $slots.aside ? 'lg:grid-cols-[1fr_320px]' : ''">
      <div class="min-w-0 flex flex-col gap-3">
        <slot />
      </div>
      <aside v-if="state !== undefined || $slots.aside" class="min-w-0 flex flex-col gap-2">
        <slot name="aside">
          <StateViewer :state="state" :label="asideLabel" />
        </slot>
      </aside>
    </div>
  </section>
</template>
