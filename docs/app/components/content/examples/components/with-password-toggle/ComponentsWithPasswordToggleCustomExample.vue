<script setup lang="ts">
const password = ref('SecurePass123')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    :button-props="{
      color: 'primary',
      variant: 'soft'
    }"
  />
</template>
