<script setup lang="ts">
const lockedColor = ref('#3b82f6')
</script>

<template>
  <MColorChooser
    v-model="lockedColor"
    disabled
    :button-props="{ label: '已锁定' }"
  />
</template>
