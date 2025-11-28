<script setup lang="ts">
const form = reactive({
  username: '',
  password: ''
})
</script>

<template>
  <div class="space-y-4">
    <UFormField label="用户名">
      <UInput
        v-model="form.username"
        leading-icon="i-lucide-user"
        placeholder="请输入用户名"
      />
    </UFormField>

    <UFormField label="密码">
      <MWithPasswordToggle
        v-model="form.password"
        leading-icon="i-lucide-lock"
        placeholder="请输入密码"
      />
    </UFormField>
  </div>
</template>
