<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3).max(20).regex(/^\w+$/),
  email: afz.email(),
  password: afz.string({ type: 'withPasswordToggle' })
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
  confirmPassword: afz.string({ type: 'withPasswordToggle' }),
  acceptTerms: afz.boolean({
    controlProps: { label: '我同意服务条款和隐私政策', required: true }
  })
}).refine(
  data => data.password === data.confirmPassword,
  { message: '两次密码不一致', path: ['confirmPassword'] }
).refine(
  data => data.acceptTerms === true,
  { message: '必须同意条款', path: ['acceptTerms'] }
)

const form = ref({})
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <template #header>
      <h2 class="text-xl font-semibold">
        注册新账号
      </h2>
    </template>

    <MAutoForm :schema="schema" :state="form" />
  </UCard>
</template>
