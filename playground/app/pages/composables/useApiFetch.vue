<script lang="ts" setup>
import type { SelectItem } from '@nuxt/ui'
import type { User } from '#auth-utils'

const { data: users } = await useApiFetch<{ content: User[] }, SelectItem[]>('/api/system/users', {
  toast: { successMessage: '用户列表加载成功' },
  transform: ({ content }) => {
    return content?.map(user => ({
      label: user.username,
      value: String(user.id)
    } satisfies SelectItem))
  }
})

const firstItem = users.value?.[0]
const value = ref(typeof firstItem === 'object' && firstItem !== null ? (firstItem as { value: string }).value : undefined)
</script>

<template>
  <USelect
    v-model="value"
    :items="users || []"
    value-key="value"
    class="w-48"
  />
</template>
