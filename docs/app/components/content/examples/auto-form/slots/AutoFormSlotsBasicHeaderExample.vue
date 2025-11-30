<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3).meta({ label: '用户名' }),
  email: afz.email().meta({ label: '邮箱' }),
  age: afz.number().min(18).meta({ label: '年龄' })
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
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <template #header>
        <UAlert
          color="primary"
          variant="subtle"
          icon="i-lucide-info"
          title="欢迎注册"
          description="请填写以下信息完成注册，所有字段均为必填项"
          class="mb-6"
        />
      </template>
    </MAutoForm>
  </UCard>
</template>
