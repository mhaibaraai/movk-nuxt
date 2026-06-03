<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(2).meta({ label: '用户名' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '密码' }),
  bio: afz.string({ type: 'textarea' }).default('一个简单的自我介绍').meta({ label: '简介' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state">
    <template #field-label:username="{ label }">
      <UBadge icon="i-lucide-user" color="success" variant="subtle" size="xs">
        {{ label }}
      </UBadge>
    </template>

    <template #field-help:password>
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-shield-check"
        description="field-help:password 只替换 password 字段的帮助说明，并保留字段默认控件"
        class="mt-2"
      />
    </template>

    <template #field-default:bio="{ setValue, value }">
      <UTextarea
        :model-value="value"
        :rows="5"
        placeholder="field-default:bio 完全替换默认 textarea"
        class="ring-2 ring-primary/30 rounded w-full"
        @update:model-value="setValue"
      />
    </template>
  </MAutoForm>
</template>
