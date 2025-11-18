<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string({ type: 'withClear' }).min(3),
  password: afz.string({ type: 'withPasswordToggle' }).min(8),
  age: afz.number().min(18),
  subscribe: afz.boolean({ controlProps: { label: '订阅我们的新闻通讯' } }),
  plan: afz.enum(['free', 'pro', 'enterprise']),
  profile: afz.object({
    bio: afz.string({ type: 'textarea' }),
    website: afz.url()
  }).meta({ label: '个人资料', collapsible: { defaultOpen: true } }),
  tags: afz.array(afz.string(), { type: 'inputTags' }).default(['标签一'])
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
  <UCard
    :ui="{
      body: 'max-h-[700px] overflow-y-auto'
    }"
  >
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

      <template #field-description:password>
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-shield-check"
          title="密码强度建议"
          class="my-2"
        >
          <template #actions>
            <ul class="space-y-1 text-xs list-disc list-inside">
              <li>至少 8 个字符</li>
              <li>包含大小写字母</li>
              <li>包含数字</li>
            </ul>
          </template>
        </UAlert>
      </template>

      <template #field-before:profile>
        <USeparator icon="i-lucide-circle-user" />
      </template>

      <template #field-hint:tags="{ value }">
        <UBadge icon="i-lucide-tags" color="info" variant="subtle">
          您已添加 {{ value?.length || 0 }} 个标签
        </UBadge>
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
            <template #actions>
              <ul class="space-y-1 text-sm list-disc list-inside">
                <li v-for="(error, index) in errors" :key="index">
                  {{ error.message }}
                </li>
              </ul>
            </template>
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
