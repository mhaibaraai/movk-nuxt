<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3).meta({ label: '用户名' }),
  role: afz.enum(['admin', 'user', 'guest']).meta({ label: '角色' })
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
      <template #footer="{ state }">
        <UCard class="mt-6">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600 dark:text-gray-400">表单完成度</span>
            <UBadge color="primary" variant="subtle">
              {{ Object.keys(state).filter(k => state[k as keyof Schema]).length }} / {{
                Object.keys(schema.shape).length }}
            </UBadge>
          </div>
          <UProgress
            :value="(Object.keys(state).filter(k => state[k as keyof Schema]).length / Object.keys(schema.shape).length) * 100"
            color="primary"
          />
        </UCard>
      </template>
    </MAutoForm>
  </UCard>
</template>
