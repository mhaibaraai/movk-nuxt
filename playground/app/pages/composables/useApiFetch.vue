<script lang="ts" setup>
import type { SelectItem } from '@nuxt/ui'
import type { User } from '#auth-utils'

const { data: users } = await useApiFetch('/api/system/users', {
  toast: { successMessage: '用户列表加载成功' },
  transform: ({ content }: {
    content: User[]
  }) => {
    return content?.map(user => ({
      label: user.username,
      value: String(user.id)
    } satisfies SelectItem))
  }
})

const value = ref(users.value?.[0]?.value)
</script>

<template>
  <USelect
    v-model="value"
    :items="users || []"
    value-key="value"
    class="w-48"
  />
</template>
