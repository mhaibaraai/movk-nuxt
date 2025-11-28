<script setup lang="ts">
const settings = reactive({
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  backgroundColor: '#f3f4f6'
})
</script>

<template>
  <div class="space-y-4">
    <UFormField label="主色调">
      <MColorChooser v-model="settings.primaryColor" />
    </UFormField>

    <UFormField label="强调色">
      <MColorChooser v-model="settings.accentColor" />
    </UFormField>

    <UFormField label="背景色">
      <MColorChooser v-model="settings.backgroundColor" />
    </UFormField>
  </div>
</template>
