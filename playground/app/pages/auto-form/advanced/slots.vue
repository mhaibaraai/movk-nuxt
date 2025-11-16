<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3),
  email: afz.email()
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <template #header>
        <div class="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded">
          <p class="text-sm">
            填写表单以继续
          </p>
        </div>
      </template>

      <template #footer="{ state }">
        <div class="mt-4 text-xs text-gray-500">
          <p>已填写字段: {{ Object.keys(state).length }}</p>
        </div>
      </template>
    </MAutoForm>
    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
