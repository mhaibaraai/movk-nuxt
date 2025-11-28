<script setup lang="ts">
const password = ref('Test@123')
</script>

<template>
  <div class="space-y-4">
    <MWithPasswordToggle
      v-model="password"
      size="sm"
      placeholder="Small"
    />

    <MWithPasswordToggle
      v-model="password"
      size="md"
      placeholder="Medium"
    />

    <MWithPasswordToggle
      v-model="password"
      size="lg"
      placeholder="Large"
    />
  </div>
</template>
