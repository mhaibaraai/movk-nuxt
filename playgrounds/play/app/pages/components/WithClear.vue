<script lang="ts" setup>
const userName = ref('张三')
</script>

<template>
  <Navbar />
  <Matrix title="带清除按钮的输入组件" description="`MWithClear` 组件的独立使用示例。">
    <UFormField label="userName" hint="用户名">
      <MWithClear
        v-model="userName"
        placeholder="输入用户名..."
        leading-icon="i-lucide-user"
        class="w-full"
      />
    </UFormField>
  </Matrix>
</template>
