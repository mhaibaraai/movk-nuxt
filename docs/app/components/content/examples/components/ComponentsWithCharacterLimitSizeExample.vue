<script setup lang="ts">
const textSm = ref('')
const textMd = ref('')
const textLg = ref('')
</script>

<template>
  <div class="space-y-4">
    <MWithCharacterLimit
      v-model="textSm"
      size="sm"
      :max-length="30"
      placeholder="Small"
    />

    <MWithCharacterLimit
      v-model="textMd"
      size="md"
      :max-length="50"
      placeholder="Medium"
    />

    <MWithCharacterLimit
      v-model="textLg"
      size="lg"
      :max-length="80"
      placeholder="Large"
    />
  </div>
</template>
