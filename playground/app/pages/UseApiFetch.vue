<script lang="ts" setup>
interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

const { data, execute } = useClientApiFetch<LoginResponse>('/auth/login', {
  method: 'POST',
  body: {
    email: 'admin@movk.com',
    password: 'Admin@2025#Secure'
  }
})
</script>

<template>
  <div v-if="data" class="break-all">
    {{ data.accessToken }}
  </div>
  <UButton @click="execute()">
    Use Api Fetch
  </UButton>
</template>
