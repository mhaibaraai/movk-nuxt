<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  email: afz.email().meta({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(6).meta({ label: '密码' }),
  remember: afz.boolean({ type: 'switch', controlProps: { label: '记住登录状态' } }).default(true).meta({ label: '记住我' })
})

const form = reactive<Partial<z.output<typeof schema>>>({})

async function onSubmit() {
  await new Promise(resolve => setTimeout(resolve, 1200))
}
</script>

<template>
  <MAutoForm
    :schema="schema"
    :state="form"
    :submit="false"
    @submit="onSubmit"
  >
    <template #header="{ loading }">
      <UAlert
        color="info"
        variant="soft"
        icon="i-lucide-log-in"
        title="header 状态展示"
        description="header 在字段渲染前接收 loading，可同步说明与提交状态"
      >
        <template v-if="loading" #actions>
          <UBadge color="info" variant="subtle">
            提交中
          </UBadge>
        </template>
      </UAlert>
    </template>

    <template #footer="{ errors, state }">
      <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <UBadge :color="errors.length ? 'error' : 'success'" variant="subtle">
          {{ errors.length ? `${errors.length} 个错误` : '校验通过' }}
        </UBadge>
        <UBadge color="neutral" variant="subtle">
          {{ state.remember ? '保持登录' : '本次登录' }}
        </UBadge>
      </div>
    </template>

    <template #submit="{ errors, loading }">
      <div class="mt-4 flex gap-2">
        <UButton type="submit" icon="i-lucide-send" :loading="loading" :disabled="errors.length > 0">
          登录
        </UButton>
        <UButton variant="outline" color="neutral" :disabled="loading">
          创建账号
        </UButton>
      </div>
    </template>
  </MAutoForm>
</template>
