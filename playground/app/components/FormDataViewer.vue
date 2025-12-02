<script lang="ts" setup>
defineProps<{
  data: unknown
}>()
</script>

<template>
  <details>
    <summary class="cursor-pointer text-sm font-medium mb-2">
      查看表单数据
    </summary>
    <pre class="text-xs">{{ data }}</pre>
  </details>
</template>
