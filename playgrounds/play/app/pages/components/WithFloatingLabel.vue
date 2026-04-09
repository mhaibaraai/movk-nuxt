<script lang="ts" setup>
const email = ref('')
const name = ref('张三')
</script>

<template>
  <Navbar />
  <Matrix title="带浮动标签的输入组件" description="`MWithFloatingLabel` 组件的独立使用示例。">
    <MWithFloatingLabel v-model="email" label="邮箱地址" class="w-full" />
    <MWithFloatingLabel v-model="name" size="xs" label="用户名" leading-icon="i-lucide-user" class="w-full" />
  </Matrix>
</template>
