<script lang="ts" setup>
defineProps<{
  form?: unknown
}>()
</script>

<template>
  <UCard
    :ui="{
      body: 'space-y-6 h-auto max-h-[80vh] overflow-y-auto',
      footer: 'h-auto max-h-[10vh] overflow-auto'
    }"
    class="min-w-lg"
  >
    <template #header>
      <slot name="header" />
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
