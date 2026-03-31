<script lang="ts" setup>
const apiKey = ref('sk-1234567890abcdef')
</script>

<template>
  <Navbar />
  <Matrix title="带复制按钮的输入组件" description="`MWithCopy` 组件的独立使用示例。">
    <UFormField label="apiKey" hint="API 密钥">
      <MWithCopy
        v-model="apiKey"
        placeholder="sk-1234567890abcdef"
        leading-icon="i-lucide-key"
        class="w-full"
      />
    </UFormField>
  </Matrix>
</template>
