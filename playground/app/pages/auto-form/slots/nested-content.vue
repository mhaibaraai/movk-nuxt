<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  profile: afz.object({
    name: afz.string().min(2),
    email: afz.email(),
    bio: afz.string().optional()
  }),
  contact: afz.object({
    $layout: afz.layout({
      class: 'grid grid-cols-2 gap-4',
      fields: {
        phone: afz.string().optional(),
        website: afz.url().optional()
      }
    })
  })
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
  <UCard>
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{ collapsible: { defaultOpen: true } }"
      @submit="onSubmit"
    >
      <template #field-content:profile="{ path, value, setValue }">
        <UAlert
          color="primary"
          variant="subtle"
          icon="i-lucide-user"
          title="个人资料"
          description="完善您的个人信息"
        />

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="姓名" :name="`${path}.name`" required>
            <UInput
              :model-value="value?.name"
              placeholder="请输入您的姓名"
              icon="i-lucide-user"
              class="w-full"
              @update:model-value="setValue('name', $event)"
            />
          </UFormField>
          <UFormField label="电子邮箱" :name="`${path}.email`" required>
            <UInput
              :model-value="value?.email"
              placeholder="请输入您的电子邮箱"
              icon="i-lucide-mail"
              type="email"
              class="w-full"
              @update:model-value="setValue('email', $event)"
            />
          </UFormField>
        </div>
        <UFormField label="简介" :name="`${path}.bio`" hint="可选">
          <UTextarea
            :model-value="value?.bio"
            placeholder="请输入您的个人简介"
            :rows="3"
            resize
            class="w-full"
            @update:model-value="setValue('bio', $event)"
          />
        </UFormField>
      </template>

      <template #field-before:contact="{ value, path }">
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-book-user"
          title="联系方式"
          description="提供您的联系信息，方便其他人与您交流"
        />

        <p class="text-gray-600 dark:text-gray-400 text-xs">
          {{ path }} 数据 ：{{ value }}
        </p>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
