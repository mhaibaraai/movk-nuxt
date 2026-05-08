<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const fieldSchema = z.object({
  username: afz.string({ label: '用户名' }),
  bio: afz.string({ label: '简介', type: 'textarea' })
})
const fieldState = reactive<Partial<z.input<typeof fieldSchema>>>({})

const submitSchema = z.object({
  email: afz.email({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle', label: '密码' })
})
const submitState = reactive<Partial<z.input<typeof submitSchema>>>({})
const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 1500))
  submitting.value = false
}

const arraySchema = z.object({
  todos: afz.array(
    afz.object({
      title: afz.string({ label: '标题' }),
      done: afz.boolean({ type: 'switch', label: '完成' })
    }),
    { label: '待办列表' }
  ).default([{ title: '示例任务', done: false }])
})
const arrayState = reactive<Partial<z.input<typeof arraySchema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Showcase title="动态字段 slot" description="`field-default:{key}` 自定义某个字段的渲染" :state="fieldState">
      <MAutoForm :schema="fieldSchema" :state="fieldState">
        <template #field-default:bio="{ path, setValue, value }">
          <UTextarea
            :model-value="value as string"
            :rows="5"
            placeholder="自定义渲染：紫色边框 textarea"
            class="ring-2 ring-violet-300 rounded w-full"
            @update:model-value="(v: string) => setValue(path, v)"
          />
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="header / footer / submit slot" description="替换默认提交按钮，自由组合 footer" :state="submitState">
      <MAutoForm :schema="submitSchema" :state="submitState" :submit-button="false" @submit="onSubmit">
        <template #header>
          <UAlert title="登录说明" description="使用 demo@movk.dev / 任意密码" color="info" variant="soft" />
        </template>
        <template #footer>
          <div class="flex gap-2 mt-2">
            <UButton type="submit" :loading="submitting">
              登录
            </UButton>
            <UButton variant="outline" :disabled="submitting">
              注册
            </UButton>
            <UButton variant="ghost" :disabled="submitting">
              忘记密码
            </UButton>
          </div>
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="数组字段动态增删" description="afz.array() 自动渲染 add/remove 按钮" :state="arrayState">
      <MAutoForm :schema="arraySchema" :state="arrayState" />
    </Showcase>
  </div>
</template>
