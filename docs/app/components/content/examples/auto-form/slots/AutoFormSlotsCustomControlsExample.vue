<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  email: afz.email().meta({ label: '邮箱' }).default('test@example.com'),
  notifications: afz.object({
    email: afz.boolean().meta({ label: 'Email 通知' }),
    sms: afz.boolean().meta({ label: 'SMS 通知' }),
    push: afz.boolean().meta({ label: 'Push 通知' })
  }).meta({ label: '通知设置' })
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
  <UCard>
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{ collapsible: { defaultOpen: true } }"
      @submit="onSubmit"
    >
      <template #field-default:email="{ value, error, setValue }">
        <UInput
          :model-value="value"
          type="email"
          placeholder="your@email.com"
          icon="i-lucide-mail"
          class="w-full"
          :trailing-icon="value ? 'i-lucide-circle-check' : undefined"
          :color="error ? 'error' : 'primary'"
          @update:model-value="setValue"
        />
      </template>

      <template #field-content:notifications="{ value, setValue }">
        <UCard>
          <div class="space-y-3">
            <div
              v-for="key in ['email', 'sms', 'push']"
              :key="key"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              @click="setValue(key, !value?.[key as keyof typeof value])"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="key === 'email' ? 'i-lucide-mail' : key === 'sms' ? 'i-lucide-message-square' : 'i-lucide-bell'"
                  class="size-5"
                />
                <div>
                  <p class="font-medium text-sm capitalize">
                    {{ key }} 通知
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ key === 'email' ? '接收邮件通知' : key === 'sms' ? '接收短信通知' : '接收推送通知' }}
                  </p>
                </div>
              </div>
              <UCheckbox disabled :model-value="value?.[key as keyof typeof value]" />
            </div>
          </div>
        </UCard>
      </template>
    </MAutoForm>
  </UCard>
</template>
