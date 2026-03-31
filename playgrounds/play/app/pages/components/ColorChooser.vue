<script lang="ts" setup>
const color = ref('#3b82f6')
const formatColor = ref('')
</script>

<template>
  <Navbar />
  <Matrix title="颜色选择器组件" description="`MColorChooser` 组件的基础用法和格式化选项。">
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="基础">
        <MColorChooser v-model="color" />
      </UFormField>

      <UFormField label="格式化显示" hint="大写十六进制">
        <MColorChooser v-model="formatColor" format="hex" />
      </UFormField>
    </div>
  </Matrix>
</template>
