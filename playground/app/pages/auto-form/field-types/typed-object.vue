<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

// 定义类型约束
interface UserInfo {
  name: string
  age: number
  email: string
}

// 1. 普通对象 - 严格匹配接口定义
const normalSchema = afz.object<UserInfo>()({
  name: afz.string().min(1, '请输入姓名'),
  age: afz.number().min(1).max(150),
  email: afz.email('请输入有效的邮箱地址')
  // TypeScript 会确保字段与 UserInfo 匹配
})

// 2. 宽松对象 - 允许额外字段
const looseSchema = afz.looseObject<UserInfo>()({
  name: afz.string().min(1, '请输入姓名'),
  age: afz.number().min(1).max(150),
  email: afz.email('请输入有效的邮箱地址')
  // 运行时可以接收其他未定义的字段，不会报错
})

// 3. 严格对象 - 禁止额外字段
const strictSchema = afz.strictObject<UserInfo>()({
  name: afz.string().min(1, '请输入姓名'),
  age: afz.number().min(1).max(150),
  email: afz.email('请输入有效的邮箱地址')
  // 运行时如果有额外字段会报错
})

// 当前使用的 schema（可切换）
const currentType = ref<'normal' | 'loose' | 'strict'>('normal')
const schema = computed(() => {
  switch (currentType.value) {
    case 'loose': return looseSchema
    case 'strict': return strictSchema
    default: return normalSchema
  }
})

type Schema = z.output<typeof normalSchema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <UCard>
    <template #header>
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold">
            Typed Object 类型约束对象
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            使用 TypeScript 接口约束对象结构，对比三种模式的区别
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">当前模式:</span>
          <UButtonGroup>
            <UButton
              :variant="currentType === 'normal' ? 'solid' : 'ghost'"
              size="xs"
              @click="currentType = 'normal'"
            >
              Normal
            </UButton>
            <UButton
              :variant="currentType === 'loose' ? 'solid' : 'ghost'"
              size="xs"
              @click="currentType = 'loose'"
            >
              Loose
            </UButton>
            <UButton
              :variant="currentType === 'strict' ? 'solid' : 'ghost'"
              size="xs"
              @click="currentType = 'strict'"
            >
              Strict
            </UButton>
          </UButtonGroup>
        </div>

        <UAlert
          v-if="currentType === 'normal'"
          icon="i-lucide-info"
          color="info"
          variant="soft"
          title="Normal Object"
          description="默认模式，TypeScript 确保字段与接口匹配"
        />
        <UAlert
          v-if="currentType === 'loose'"
          icon="i-lucide-check"
          color="success"
          variant="soft"
          title="Loose Object"
          description="宽松模式，运行时允许额外字段，类型层面保证必需字段存在"
        />
        <UAlert
          v-if="currentType === 'strict'"
          icon="i-lucide-shield-alert"
          color="warning"
          variant="soft"
          title="Strict Object"
          description="严格模式，运行时和类型层面都禁止额外字段"
        />
      </div>
    </template>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />

    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
