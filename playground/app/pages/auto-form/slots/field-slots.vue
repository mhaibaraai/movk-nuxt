<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3, '用户名至少 3 个字符'),
  email: afz.email('请输入有效的邮箱地址'),
  password: afz.string().min(8, '密码至少 8 个字符'),
  bio: afz.string({ type: 'textarea' })
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
  <Matrix :form="form">
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        ui: {
          label: 'flex items-center',
          hint: 'flex items-center'
        }
      }"
      @submit="onSubmit"
    >
      <template #field-label:username="{ label }">
        <span>{{ label }}</span>
        <UBadge
          color="primary"
          variant="subtle"
          size="xs"
          class="ml-2"
        >
          必填
        </UBadge>
      </template>

      <template #field-hint:username>
        <UIcon name="i-lucide-info" class="text-warning mr-2" />
        <span>这将是您的唯一标识</span>
      </template>

      <template #field-label:email="{ label }">
        <UBadge icon="i-lucide-mail" :label="label" />
      </template>

      <template #field-description:email>
        <span class="text-xs mt-1 text-success-600">
          我们将向此邮箱发送验证链接
        </span>
      </template>

      <template #field-help:password>
        <ul class="space-y-0.5 list-disc list-inside">
          <li>至少 8 个字符</li>
          <li>包含大小写字母</li>
          <li>包含数字和特殊字符</li>
        </ul>
      </template>

      <template #field-error:bio="{ error }">
        <span v-if="error" class="text-xs text-red-700 dark:text-red-300 bg-red-50 p-2 rounded w-full">
          <UIcon name="i-lucide-frown" class="text-red-500" />
          {{ error }}
        </span>
      </template>
    </MAutoForm>
  </Matrix>
</template>
