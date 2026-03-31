<script setup lang="ts">
const form = reactive({
  email: '',
  password: ''
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <MWithFloatingLabel v-model="form.email" label="邮箱地址" leading-icon="i-lucide-mail" type="email" />
    <MWithFloatingLabel v-model="form.password" label="密码" leading-icon="i-lucide-lock" type="password" />
  </div>
</template>
