<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  email: afz.email({ controlProps: { placeholder: '请输入合法邮箱' } }).meta({ label: '邮箱' })
})

const state = ref<Record<string, unknown>>({})
const loading = ref(false)
const errors = ref<unknown[]>([])
const toast = useToast()

function onSearch(payload: unknown) {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.add({ title: '查询完成', description: JSON.stringify(payload), color: 'success' })
  }, 1500)
}

function onError(event: { errors?: unknown[] }) {
  errors.value = event.errors ?? []
  toast.add({ title: '校验失败', description: `共 ${errors.value.length} 项错误`, color: 'error' })
}
</script>

<template>
  <MSearchForm
    v-model="state"
    :schema="schema"
    :cols="2"
    :loading="loading"
    :validate-on="['blur']"
    @submit="onSearch"
    @error="onError"
  />
</template>
