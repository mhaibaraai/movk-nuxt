<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  // 字符串字段
  username: afz.string().min(3),
  password: afz.string({ type: 'withPasswordToggle' }).min(8),

  // 数字字段
  age: afz.number().min(18),

  // 布尔字段
  subscribe: afz.boolean(),

  // 枚举字段
  plan: afz.enum(['free', 'pro', 'enterprise']),

  // 嵌套对象
  profile: afz.object({
    bio: afz.string({ type: 'textarea' }),
    website: afz.url()
  }),

  // 数组字段
  tags: afz.array(afz.string(), { type: 'input-tags' })
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

const completedFields = computed(() => {
  return Object.entries(form.value).filter(([, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.values(value).some(v => v !== undefined && v !== null && v !== '')
    }
    return value !== undefined && value !== null && value !== ''
  }).length
})

const totalFields = Object.keys(schema.shape).length
const progress = computed(() => Math.round((completedFields.value / totalFields) * 100))
</script>

<template>
  <Navbar />
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <template #header="{ loading }">
        <div class="mb-6 space-y-4">
          <UAlert
            color="primary"
            variant="subtle"
            icon="i-lucide-rocket"
            title="创建您的账户"
            description="完成以下步骤开始使用我们的服务"
          >
            <template v-if="loading" #actions>
              <UBadge color="primary" variant="subtle">
                处理中...
              </UBadge>
            </template>
          </UAlert>

          <UCard>
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-600 dark:text-gray-400">完成进度</span>
              <UBadge color="primary" variant="subtle">
                {{ progress }}%
              </UBadge>
            </div>
            <UProgress :value="progress" color="primary" />
          </UCard>
        </div>
      </template>

      <template #field-label:username="{ label }">
        <UBadge
          icon="i-lucide-user"
          :label="label"
          color="primary"
          variant="subtle"
          size="xs"
        />
        <UBadge
          color="error"
          variant="subtle"
          size="xs"
          class="ml-2"
        >
          必填
        </UBadge>
      </template>

      <template #field-label:password="{ label }">
        <UBadge
          icon="i-lucide-lock"
          :label="label"
          color="success"
          variant="subtle"
          size="xs"
        />
      </template>

      <template #field-help:password>
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-shield-check"
          title="密码强度建议"
          class="mt-2"
        >
          <ul class="space-y-1 text-xs list-disc list-inside">
            <li>至少 8 个字符</li>
            <li>包含大小写字母</li>
            <li>包含数字</li>
          </ul>
        </UAlert>
      </template>

      <template #field-content:profile>
        <div class="space-y-4">
          <UDivider icon="i-lucide-user-circle" label="个人资料" />
          <slot />
        </div>
      </template>

      <template #field-content:tags="{ count }">
        <div class="space-y-3">
          <span class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-tags" class="size-4" />
            <span>已添加 {{ count || 0 }} 个标签</span>
          </span>
          <slot />
        </div>
      </template>

      <template #footer="{ errors }">
        <div class="mt-6 space-y-4">
          <UAlert
            v-if="errors.length > 0"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
            :title="`发现 ${errors.length} 个错误`"
            description="请修正以下错误后重新提交"
          >
            <ul class="space-y-1 text-sm list-disc list-inside mt-2">
              <li v-for="(error, i) in errors" :key="i">
                {{ typeof error === 'string' ? error : JSON.stringify(error) }}
              </li>
            </ul>
          </UAlert>

          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            description="提交表单即表示您同意我们的服务条款和隐私政策"
          />
        </div>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
