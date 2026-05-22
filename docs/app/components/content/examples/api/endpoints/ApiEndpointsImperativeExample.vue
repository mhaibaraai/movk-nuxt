<script setup lang="ts">
const { $api } = useNuxtApp()

const data = ref<unknown>(null)
const pending = ref(false)
const error = ref<string | null>(null)

async function call() {
  pending.value = true
  error.value = null
  try {
    data.value = await $api.use('v2')('/profile')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" icon="i-lucide-zap" :loading="pending" @click="call">
      $api.use('v2')('/profile')
    </UButton>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ error ? { error } : data }}</pre>
  </div>
</template>
