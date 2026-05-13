<script setup lang="ts">
import type { FormInputEvents } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()

const minimalSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '姓名' } }),
  email: afz.email()
})
const minimalState = reactive<Partial<z.output<typeof minimalSchema>>>({})

const optionalSchema = afz.object({
  name: afz.string(),
  nick: afz.string().optional(),
  age: afz.number().default(18)
})
const optionalState = reactive<Partial<z.output<typeof optionalSchema>>>({})

const validateOnSchema = afz.object({
  email: afz.email('请输入合法邮箱')
})
const validateOnState = ref<Partial<z.output<typeof validateOnSchema>>>({})
const validateItems: FormInputEvents[] = ['input', 'change', 'blur']
const validateOn = ref<FormInputEvents[]>(['blur'])
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="最小表单渲染" description="仅传入 schema 与 state，即可根据字段类型自动渲染表单" :state="minimalState">
      <MAutoForm :schema="minimalSchema" :state="minimalState" />
    </Showcase>

    <Showcase title="可选字段与默认值" description="optional() 标记非必填字段，default() 在表单初始化时写入默认值" :state="optionalState">
      <MAutoForm :schema="optionalSchema" :state="optionalState" />
    </Showcase>

    <Showcase title="校验触发时机" description="通过 validate-on 切换 input、change、blur 事件，观察字段校验触发时机" :state="validateOnState">
      <template #toolbar>
        <USelect v-model="validateOn" :items="validateItems" multiple size="xs" class="w-25" />
      </template>
      <MAutoForm :schema="validateOnSchema" :state="validateOnState" :validate-on="validateOn" />
    </Showcase>
  </div>
</template>
