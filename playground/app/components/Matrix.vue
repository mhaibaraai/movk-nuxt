<script lang="ts" setup>
defineProps<{
  form?: unknown
  title?: string
  description?: string
}>()
</script>

<template>
  <UCard
    :ui="{
      body: 'space-y-6 h-auto max-h-[65vh] overflow-y-auto',
      footer: 'h-auto max-h-[10vh] overflow-auto'
    }"
    class="min-w-lg"
  >
    <template #header>
      <slot name="header">
        <div v-if="title">
          <h3 class="text-base font-semibold leading-6">
            {{ title }}
          </h3>

          <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
      </slot>
    </template>
    <slot />
    <template v-if="form" #footer>
      <details>
        <summary class="cursor-pointer text-muted text-sm font-medium mb-2">
          查看表单数据
        </summary>
        <pre class="text-xs">{{ form }}</pre>
      </details>
    </template>
  </UCard>
</template>
