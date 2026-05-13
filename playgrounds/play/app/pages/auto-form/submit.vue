<script setup lang="ts">
import type { z } from 'zod'
import { UButton } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const autoSchema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' })
})
const autoState = reactive<Partial<z.output<typeof autoSchema>>>({})
async function onAutoSubmit() {
  await new Promise(r => setTimeout(r, 1500))
  toast.add({ title: '提交成功', description: 'loadingAuto 自动维护按钮 loading', color: 'success' })
}

const manualSchema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' })
})
const manualState = reactive<Partial<z.output<typeof manualSchema>>>({})
const manualLoading = ref(false)
async function onManualSubmit() {
  manualLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 1500))
    toast.add({ title: '提交成功（手动 loading）', color: 'success' })
  }
  finally {
    manualLoading.value = false
  }
}

const errSchema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名（最少 2 个字符）' })
})
const errState = reactive<Partial<z.output<typeof errSchema>>>({})
async function onErrSubmit() {
  try {
    await new Promise((_, reject) => setTimeout(() => reject(new Error('API 返回 500')), 1000))
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '未知错误'
    toast.add({ title: '提交失败', description: msg, color: 'error' })
  }
}
function onErrError() {
  toast.add({ title: '校验未通过', description: '请检查字段输入', color: 'warning' })
}

const refSchema = afz.object({
  name: afz.string().min(2).meta({ label: '姓名' }),
  age: afz.number().min(0).meta({ label: '年龄' })
})
const refState = reactive<Partial<z.output<typeof refSchema>>>({})
const apiForm = useTemplateRef('apiForm')

async function programmaticSubmit() {
  await apiForm.value?.formRef?.submit()
}
function programmaticReset() {
  apiForm.value?.reset()
}
function programmaticClear() {
  apiForm.value?.clear()
}
async function onRefSubmit() {
  await new Promise(r => setTimeout(r, 600))
  toast.add({ title: '通过暴露 API 提交成功', color: 'success' })
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase
      title="自动 loading 提交"
      description="@submit 返回 Promise，按钮 loading 自动管理"
      :state="autoState"
    >
      <MAutoForm :schema="autoSchema" :state="autoState" @submit="onAutoSubmit" />
    </Showcase>

    <Showcase
      title="手动 loading 提交"
      description=":loading-auto=false，通过 submitButtonProps.loading 自管"
      :state="manualState"
    >
      <MAutoForm
        :schema="manualSchema"
        :state="manualState"
        :loading-auto="false"
        :submit-button-props="{ loading: manualLoading, label: manualLoading ? '提交中…' : '提交' }"
        @submit="onManualSubmit"
      />
    </Showcase>

    <Showcase
      title="提交异常与校验错误"
      description="@submit 内 try/catch；@error 监听校验失败"
      :state="errState"
    >
      <MAutoForm
        :schema="errSchema"
        :state="errState"
        @submit="onErrSubmit"
        @error="onErrError"
      />
    </Showcase>

    <Showcase
      title="实例 API 提交"
      description="useTemplateRef 调用 submit / reset / clear"
      :state="refState"
    >
      <template #toolbar>
        <UButtonGroup size="xs">
          <UButton label="submit()" @click="programmaticSubmit" />
          <UButton variant="soft" label="reset()" @click="programmaticReset" />
          <UButton variant="soft" color="neutral" label="clear()" @click="programmaticClear" />
        </UButtonGroup>
      </template>
      <MAutoForm
        ref="apiForm"
        :schema="refSchema"
        :state="refState"
        :submit-button="false"
        @submit="onRefSubmit"
      />
    </Showcase>
  </div>
</template>
