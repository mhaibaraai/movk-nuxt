<script setup lang="ts">
const publicConfig = useRuntimeConfig().public.movkApi
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm text-muted">
      <code>auth.unauthorized</code> 控制 401 时的行为；docs 站点关闭重定向便于演示，生产建议启用 <code>redirect: true</code> + <code>loginPath</code>。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ publicConfig.auth?.unauthorized }}</pre>
  </div>
</template>
