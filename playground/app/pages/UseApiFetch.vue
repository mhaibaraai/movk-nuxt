<script lang="ts" setup>
interface User {
  id: number
  username: string
  token: string
}

const { data, execute } = useClientApiFetch<User>('/login', {
  method: 'POST',
  body: {
    username: 'admin',
    password: 'admin123',
    validateCode: 48,
    rememberMe: false
  }
})
</script>

<template>
  {{ data?.username }}
  <UButton @click="execute()">
    Use Api Fetch
  </UButton>
</template>
