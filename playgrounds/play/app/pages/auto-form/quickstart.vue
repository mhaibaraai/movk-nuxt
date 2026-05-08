<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const minimalSchema = z.object({
  name: afz.string({ controlProps: { placeholder: '姓名' } }),
  email: afz.email()
})
const minimalState = reactive<Partial<z.input<typeof minimalSchema>>>({})

const optionalSchema = z.object({
  name: afz.string(),
  nick: afz.string().optional(),
  age: afz.number().default(18)
})
const optionalState = reactive<Partial<z.input<typeof optionalSchema>>>({})

const validateOnSchema = z.object({
  email: afz.email('请输入合法邮箱')
})
const validateOnState = reactive<Partial<z.input<typeof validateOnSchema>>>({})
const validateOn = ref<('input' | 'change' | 'blur')[]>(['blur'])
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Showcase title="最小用例" description="仅 schema + state，自动渲染表单" :state="minimalState">
      <MAutoForm :schema="minimalSchema" :state="minimalState" />
    </Showcase>

    <Showcase
      title="optional / default"
      description="optional() 字段非必填；default() 提供默认值"
      :state="optionalState"
    >
      <MAutoForm :schema="optionalSchema" :state="optionalState" />
    </Showcase>

    <Showcase
      title="validateOn 时机"
      description="切换数组成员观察校验时机变化"
      :state="validateOnState"
    >
      <template #toolbar>
        <USelect v-model="validateOn" :items="['input', 'change', 'blur']" multiple size="xs" class="w-44" />
      </template>
      <MAutoForm :schema="validateOnSchema" :state="validateOnState" :validate-on="validateOn" />
    </Showcase>
  </div>
</template>
