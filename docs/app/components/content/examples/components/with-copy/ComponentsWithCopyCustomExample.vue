<script setup lang="ts">
const code = ref('ABC123XYZ')
</script>

<template>
  <MWithCopy
    v-model="code"
    color="primary"
    size="lg"
    :button-props="{
      variant: 'soft',
      color: 'primary'
    }"
    placeholder="兑换码"
  />
</template>
