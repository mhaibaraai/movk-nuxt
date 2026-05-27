<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  profile: afz.object({
    displayName: afz.string().meta({ label: '显示名称' }),
    website: afz.url().meta({ label: '个人网站' }),
    bio: afz.string({ type: 'textarea' }).meta({ label: '简介' })
  }).default({
    displayName: 'Movk User',
    website: 'https://movk.dev',
    bio: '使用 field-content:profile 接管对象字段渲染。'
  }).meta({ label: '个人资料', collapsible: { defaultOpen: true } })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state">
    <template #field-content:profile="{ path, value, setValue }">
      <div class="space-y-4 rounded-md border border-default p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">
              自定义个人资料
            </p>
            <p class="text-sm text-muted">
              每个控件都通过相对 key 更新 profile 子字段
            </p>
          </div>
          <UBadge color="info" variant="subtle">
            object
          </UBadge>
        </div>

        <UFormField label="显示名称" :name="`${path}.displayName`" required>
          <UInput
            :model-value="value?.displayName"
            icon="i-lucide-user"
            placeholder="显示名称"
            @update:model-value="setValue('displayName', $event)"
          />
        </UFormField>

        <UFormField label="个人网站">
          <UInput
            :model-value="value?.website"
            icon="i-lucide-link"
            placeholder="https://movk.dev"
            @update:model-value="setValue('website', $event)"
          />
        </UFormField>

        <UFormField label="简介">
          <UTextarea
            :model-value="value?.bio"
            :rows="4"
            placeholder="简介"
            @update:model-value="setValue('bio', $event)"
          />
        </UFormField>
      </div>
    </template>
  </MAutoForm>
</template>
