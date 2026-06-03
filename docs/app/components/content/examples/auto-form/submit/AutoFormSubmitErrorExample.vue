<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名（最少 2 个字符）' })
})
const state = reactive<Partial<z.output<typeof schema>>>({})

async function onSubmit() {
  try {
    await new Promise((_, reject) => setTimeout(() => reject(new Error('API 返回 500')), 1000))
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '未知错误'
    toast.add({ title: '提交失败', description: msg, color: 'error' })
  }
}
function onError() {
  toast.add({ title: '校验未通过', description: '请检查字段输入', color: 'warning' })
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state" @submit="onSubmit" @error="onError" />
</template>
