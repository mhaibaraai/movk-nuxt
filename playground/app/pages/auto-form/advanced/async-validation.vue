<script lang="ts" setup>
const { afz } = useAutoForm()

// 模拟异步验证（检查用户名是否已存在）
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const taken = ['admin', 'user', 'test']
  return !taken.includes(username.toLowerCase())
}

const schema = afz.object({
  username: afz.string().min(3),
  email: afz.email()
}).refine(
  async (data) => {
    if (!data.username) return true
    return await checkUsernameAvailable(data.username)
  },
  {
    message: '该用户名已被占用',
    path: ['username']
  }
)

const form = ref({})
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        尝试输入 "admin"、"user" 或 "test" 作为用户名，将触发验证失败。
      </p>
    </div>

    <MAutoForm :schema="schema" :state="form" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
