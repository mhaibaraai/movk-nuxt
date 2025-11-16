<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  profile: afz.object({
    name: afz.string().min(2),
    email: afz.email(),
    age: afz.number().min(18)
  }).meta({ label: '个人资料' }),
  settings: afz.object({
    theme: afz.enum(['light', 'dark', 'auto']),
    notifications: afz.boolean()
  }).meta({ label: '设置' })
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
  <UCard class="mt-6">
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        collapsible: { defaultOpen: true }
      }"
      @submit="onSubmit"
    >
      <template #field-content:profile>
        <div class="space-y-4">
          <UAlert
            color="primary"
            variant="subtle"
            icon="i-lucide-user"
            title="个人信息"
            description="这些信息将显示在您的公开资料中"
          />

          <slot />
        </div>
      </template>

      <template #field-content:settings>
        <div class="space-y-4">
          <UAlert
            color="info"
            variant="subtle"
            icon="i-lucide-settings"
            title="偏好设置"
            description="自定义您的应用体验"
          />

          <slot />
        </div>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
