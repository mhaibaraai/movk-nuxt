<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' }).default('默认值'),
  age: afz.number().min(0).meta({ label: '年龄' })
})
const state = reactive<Partial<z.output<typeof schema>>>({})
const apiForm = useTemplateRef('apiForm')

async function onSubmit() {
  await new Promise(r => setTimeout(r, 600))
  toast.add({ title: '通过暴露 API 提交成功', color: 'success' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <UButton size="sm" label="submit()" @click="apiForm?.formRef?.submit()" />
      <UButton size="sm" variant="soft" label="reset()" @click="apiForm?.reset()" />
      <UButton size="sm" variant="soft" color="neutral" label="clear()" @click="apiForm?.clear()" />
    </div>
    <MAutoForm ref="apiForm" :schema="schema" :state="state" :submit-button="false" @submit="onSubmit" />
  </div>
</template>
