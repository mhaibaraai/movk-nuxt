<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3),
  email: afz.email(),
  role: afz.enum(['admin', 'user', 'guest']),
  active: afz.boolean({ controlProps: { label: '是否激活账户' } })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="通用字段插槽" description="使用通用的 `field-*` 插槽为表单中的所有字段应用统一的自定义样式。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <template #field-label="{ label, path }">
        <UBadge
          :color="path === 'username' ? 'primary' : path === 'email' ? 'success' : path === 'role' ? 'info' : 'warning'"
          variant="subtle"
          size="xs"
        >
          {{ label }}
        </UBadge>
      </template>

      <template #field-hint="{ path }">
        <span class="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <UIcon name="i-lucide-sparkles" class="size-3" />
          <span>字段路径: {{ path }}</span>
        </span>
      </template>

      <template #field-error="{ error }">
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :description="String(error)"
            class="mt-2"
          />
        </transition>
      </template>
    </MAutoForm>
  </Matrix>
</template>
