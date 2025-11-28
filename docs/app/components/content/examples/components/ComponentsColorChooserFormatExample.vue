<script setup lang="ts">
const hexColor = ref('#ff6b6b')
const rgbColor = ref('rgb(107, 182, 255)')
const hslColor = ref('hsl(210, 100%, 71%)')
</script>

<template>
  <div class="space-y-4">
    <UFormField label="HEX 格式">
      <MColorChooser v-model="hexColor" format="hex" />
    </UFormField>

    <UFormField label="RGB 格式">
      <MColorChooser v-model="rgbColor" format="rgb" />
    </UFormField>

    <UFormField label="HSL 格式">
      <MColorChooser v-model="hslColor" format="hsl" />
    </UFormField>
  </div>
</template>
