<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' })
})
const state = reactive<Partial<z.output<typeof schema>>>({})

async function onSubmit() {
  await new Promise(r => setTimeout(r, 1500))
  toast.add({ title: '提交成功', description: 'loadingAuto 自动维护按钮 loading', color: 'success' })
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state" @submit="onSubmit" />
</template>
