<script lang="ts" setup>
import { sleep } from '@movk/core'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const toast = useToast()
const { afz } = useAutoForm()
const autoForm = useTemplateRef('autoForm')

const schema = afz.object({
  username: afz.string().min(3, '用户名至少 3 个字符'),
  email: afz.email('请输入有效的邮箱地址').default('test@example.com'),
  password: afz.string({ type: 'withPasswordToggle' }).min(8, '密码至少 8 个字符'),
  confirmPassword: afz.string({ type: 'withPasswordToggle' }).min(8, '确认密码至少 8 个字符'),
  agreeToTerms: afz.boolean({ controlProps: { label: '我同意服务条款和隐私政策' } })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

const isSubmitting = ref(false)

function clearForm() {
  autoForm.value?.clear()
}

function resetForm() {
  autoForm.value?.reset()
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  await sleep(2000)

  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })

  isSubmitting.value = false
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="自定义提交区域" description="使用 `submit` 插槽完全控制提交按钮及其周围的逻辑和 UI。">
    <MAutoForm
      ref="autoForm"
      :schema="schema"
      :state="form"
      :submit-button="false"
      @submit="onSubmit"
    >
      <template #header>
        <UAlert
          color="primary"
          variant="subtle"
          icon="i-lucide-shield-check"
          title="用户注册"
          description="请填写以下信息创建您的账户"
          class="mb-6"
        />
      </template>

      <template #submit="{ loading, errors, fields, state }">
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-center gap-2">
              <UIcon
                :name="Object.keys(errors).length > 0 ? 'i-lucide-circle-alert' : 'i-lucide-circle-check'"
                :class="Object.keys(errors).length > 0 ? 'text-red-500' : 'text-green-500'"
              />
              <span class="text-sm font-medium">
                {{ Object.keys(errors).length > 0 ? '请修复表单错误' : '表单准备就绪' }}
              </span>
            </div>

            <div class="text-xs text-gray-500 dark:text-gray-400">
              已填写 {{ Object.keys(state).filter(k => state[k as keyof Schema] !== undefined && state[k as keyof Schema]
                !== '').length }} / {{ fields.length }} 字段
            </div>
          </div>

          <div class="flex gap-3">
            <UButton
              type="submit"
              :loading="loading || isSubmitting"
              color="primary"
              size="lg"
              icon="i-lucide-user-plus"
              :disabled="!form.agreeToTerms"
            >
              {{ loading || isSubmitting ? '正在注册...' : '创建账户' }}
            </UButton>

            <UButton
              type="button"
              variant="outline"
              color="neutral"
              size="lg"
              icon="i-lucide-rotate-ccw"
              @click="resetForm()"
            >
              重置
            </UButton>

            <UButton
              type="button"
              variant="outline"
              color="neutral"
              size="lg"
              icon="i-lucide-eraser"
              @click="clearForm()"
            >
              清空
            </UButton>
          </div>

          <UAlert
            v-if="Object.keys(errors).length > 0"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            title="表单验证失败"
          >
            <template #description>
              <ul class="mt-2 space-y-1">
                <li v-for="(error, field) in errors" :key="field" class="text-sm">
                  • {{ error }}
                </li>
              </ul>
            </template>
          </UAlert>
        </div>
      </template>
    </MAutoForm>
  </Matrix>
</template>
