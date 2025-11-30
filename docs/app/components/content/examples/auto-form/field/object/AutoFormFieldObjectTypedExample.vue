<script lang="ts" setup>
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
  email: 'test@example.com',
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

async function click() {
  const parsed = schema.value.safeParse(testUser)
  if (!parsed.success) {
    toast.add({
      title: '验证失败',
      color: 'error',
      description: JSON.stringify(parsed.error.issues, null, 2)
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
  <UCard class="space-y-4">
    <template #header>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">选择对象类型：</span>
        <USelect v-model="currentType" :items="items" />
      </div>
    </template>

    <MAutoForm :schema="schema" :submit-button="false">
      <template #footer>
        <UButton color="primary" @click="click">
          验证类型
        </UButton>
      </template>
    </MAutoForm>
  </UCard>
</template>
