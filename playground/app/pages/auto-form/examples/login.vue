<script lang="ts" setup>
const { afz } = useAutoForm()

interface LoginForm {
  email: string
  password: string
}

const schema = afz.object({
  email: afz.email(),
  password: afz.string({ type: 'withPasswordToggle' }).min(6)
})

const form = ref<LoginForm>({} as LoginForm)

function handleSubmit() {
  console.log('Login:', form.value)
  alert(`登录成功！\n邮箱: ${form.value.email}`)
}
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <template #header>
      <h2 class="text-xl font-semibold">
        登录
      </h2>
    </template>

    <MAutoForm :schema="schema" :state="form" @submit="handleSubmit" />
  </UCard>
</template>
