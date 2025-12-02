<script setup lang="ts">
const themeColor = ref('#3b82f6')
</script>

<template>
  <MColorChooser
    v-model="themeColor"
    :button-props="{
      label: '选择主题色',
      color: 'primary',
      variant: 'outline',
      class: 'w-full'
    }"
  />
</template>
