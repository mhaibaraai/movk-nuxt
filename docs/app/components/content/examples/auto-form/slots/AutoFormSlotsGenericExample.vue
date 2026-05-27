<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3).meta({ label: '用户名', hint: '至少 3 个字符' }),
  email: afz.email().meta({ label: '邮箱' }),
  role: afz.enum(['admin', 'user', 'guest']).meta({ label: '角色' }),
  active: afz.boolean({ controlProps: { label: '启用账户' } }).default(true).meta({ label: '状态' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state" :validate-on="['input', 'blur']">
    <template #field-label="{ label, path }">
      <span class="inline-flex items-center gap-2">
        <UBadge color="primary" variant="subtle" size="xs">
          {{ label }}
        </UBadge>
        <span class="text-xs text-muted">
          {{ path }}
        </span>
      </span>
    </template>

    <template #field-hint="{ hint }">
      <span class="inline-flex items-center gap-1 text-xs text-muted">
        <UIcon name="i-lucide-info" class="size-3" />
        <span>{{ hint || '通用 hint slot' }}</span>
      </span>
    </template>

    <template #field-error="{ error }">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :description="String(error)"
        class="mt-2"
      />
    </template>
  </MAutoForm>
</template>
