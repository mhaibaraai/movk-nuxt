<script lang="ts" setup>
const phoneDefault = ref('')
const phoneUS = ref('')
</script>

<template>
  <Navbar />
  <Matrix title="电话号码输入组件" description="`MAsPhoneNumberInput` 组件的独立使用示例。">
    <UFormField label="默认（中国大陆）" hint="掩码 ### #### ####，区号 +86">
      <MAsPhoneNumberInput v-model="phoneDefault" class="w-full" />
    </UFormField>
    <UFormField label="自定义（美国）" hint="掩码 (###) ###-####，区号 +1">
      <MAsPhoneNumberInput
        v-model="phoneUS"
        dial-code="+1"
        mask="(###) ###-####"
        class="w-full"
      />
    </UFormField>
  </Matrix>
</template>
