<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }),
  email: afz.email({ controlProps: { placeholder: '请输入合法邮箱' } }).meta({ label: '邮箱' }).optional()
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({})
const loading = ref(false)
const toast = useToast()

function onSearch(event: FormSubmitEvent<Schema>) {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.add({ title: '查询完成', description: JSON.stringify(event.data), color: 'success' })
  }, 1500)
}

function onError(event: FormErrorEvent) {
  toast.add({ title: '校验失败', description: `共 ${event.errors?.length ?? 0} 项错误`, color: 'error' })
}
</script>

<template>
  <MSearchForm
    v-model="state"
    :schema="schema"
    :loading="loading"
    :validate-on="['blur']"
    @submit="onSearch"
    @error="onError"
  />
</template>
