<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  email: afz.email(),
  notifications: afz.object({
    email: afz.boolean(),
    sms: afz.boolean(),
    push: afz.boolean()
  }),
  preferences: afz.array(
    afz.object({
      category: afz.enum(['news', 'updates', 'marketing']),
      frequency: afz.enum(['daily', 'weekly', 'monthly'])
    })
  )
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({
  preferences: [
    { category: 'news', frequency: 'daily' }
  ]
})

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
  <UCard class="mt-6">
    <template #header>
      <h2 class="text-xl font-bold">
        自定义控件插槽
      </h2>
      <p class="text-sm text-gray-500 mt-1">
        使用 default 插槽完全自定义字段的控件渲染
      </p>
    </template>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <!-- 自定义 email 输入控件 -->
      <template #field-default:email="{ value, setValue, error }">
        <UInput
          :model-value="value"
          type="email"
          placeholder="your@email.com"
          icon="i-lucide-mail"
          :trailing-icon="value ? 'i-lucide-check-circle' : undefined"
          :color="error ? 'error' : 'primary'"
          @update:model-value="setValue"
        />
      </template>

      <!-- 自定义通知开关组 -->
      <template #field-default:notifications="{ value, setValue }">
        <UCard>
          <div class="space-y-3">
            <div
              v-for="key in ['email', 'sms', 'push']"
              :key="key"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              @click="setValue({ ...value, [key]: !(value?.[key as keyof typeof value]) })"
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
              <UToggle
                :model-value="value?.[key as keyof typeof value] || false"
                @click.stop
                @update:model-value="setValue({ ...value, [key]: $event })"
              />
            </div>
          </div>
        </UCard>
      </template>

      <!-- 自定义数组项渲染 -->
      <template #field-content:preferences="{ count }">
        <div class="space-y-4">
          <UAlert
            color="info"
            variant="subtle"
            icon="i-lucide-sliders"
            title="偏好设置"
          >
            <template #actions>
              <UBadge color="info" variant="subtle">
                {{ count || 0 }} 项
              </UBadge>
            </template>
          </UAlert>

          <div class="space-y-3">
            <slot />
          </div>
        </div>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>

<style scoped>
input {
  background-color: white;
}

.dark input {
  background-color: rgb(17 24 39);
  color: white;
}
</style>
