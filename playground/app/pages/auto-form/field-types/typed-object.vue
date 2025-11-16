<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

interface UserInfo {
  name: string
  age: number
  email: string
}

const userSchema = {
  name: afz.string().min(1, '请输入姓名').default('张三'),
  age: afz.number().min(1).max(150).default(18),
  email: afz.email('请输入有效的邮箱地址').default('example@example.com')
}

const testUser = {
  name: '张三',
  age: 28,
  email: 'accept@example.com',
  extraField: '我是额外字段'
}

const normalSchema = afz.object<UserInfo>()(userSchema)

const looseSchema = afz.looseObject<UserInfo>()(userSchema)

const strictSchema = afz.strictObject<UserInfo>()(userSchema)

const currentType = ref<'normal' | 'loose' | 'strict'>('normal')
const items = [
  { label: 'Normal', value: 'normal' },
  { label: 'Loose', value: 'loose' },
  { label: 'Strict', value: 'strict' }
]
const schema = computed(() => {
  switch (currentType.value) {
    case 'loose': return looseSchema
    case 'strict': return strictSchema
    default: return normalSchema
  }
})

type Schema = z.output<typeof normalSchema>

const form = ref<Partial<Schema>>({})

async function click() {
  const parsed = schema.value.safeParse(testUser)
  if (!parsed.success) {
    toast.add({
      title: '验证失败',
      color: 'error',
      description: JSON.stringify(parsed.error, null, 2)
    })
  } else {
    toast.add({
      title: '验证成功',
      color: 'success',
      description: JSON.stringify(parsed.data, null, 2)
    })
  }
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
          <UTabs v-model="currentType" size="xs" :items="items" />
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

    <MAutoForm :schema="schema" :state="form" :submit-button="false">
      <template #footer>
        <UButton color="primary" @click="click">
          验证类型
        </UButton>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
