<script lang="ts" setup>
const userName = ref('张三')
</script>

<template>
  <Navbar />
  <UCard class="w-lg">
    <UFormField label="userName" hint="用户名">
      <MWithClear
        v-model="userName"
        placeholder="输入用户名..."
        leading-icon="i-lucide-user"
        class="w-full"
      />
    </UFormField>
  </UCard>
</template>
