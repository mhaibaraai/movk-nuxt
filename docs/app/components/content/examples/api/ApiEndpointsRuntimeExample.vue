<script setup lang="ts">
const publicConfig = useRuntimeConfig().public.movkApi
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm text-muted">
      在 <code>nuxt.config</code> 的 <code>movk.api.endpoints</code> 注册新别名后即可被 <code>endpoint</code> 选项引用。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ { defaultEndpoint: publicConfig.defaultEndpoint, endpoints: publicConfig.endpoints } }}</pre>
  </div>
</template>
