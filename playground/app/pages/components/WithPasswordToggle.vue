<script lang="ts" setup>
const password = ref('Test@1234')
</script>

<template>
  <Navbar />
  <UCard class="w-lg">
    <UFormField label="带图标的密码" hint="你的密码">
      <MWithPasswordToggle
        v-model="password"
        placeholder="输入密码..."
        leading-icon="i-lucide-lock"
        class="w-full"
      />
    </UFormField>
  </UCard>
</template>
