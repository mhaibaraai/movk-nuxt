<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' })
})
const state = reactive<Partial<z.output<typeof schema>>>({})
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 1500))
    toast.add({ title: '提交成功（手动 loading）', color: 'success' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <MAutoForm
    :schema="schema"
    :state="state"
    :loading-auto="false"
    :submit-button-props="{ loading, label: loading ? '提交中…' : '提交' }"
    @submit="onSubmit"
  />
</template>
