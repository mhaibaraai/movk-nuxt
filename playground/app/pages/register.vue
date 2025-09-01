<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod/v4'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
useSeoMeta({
  title: computed(() => t('auth.registerTitle')),
})

const authForm = ref<{ state: { password?: string } } | null>(null)

const fields = computed(() => [
  {
    name: 'email',
    type: 'text' as const,
    label: t('auth.email.label'),
    placeholder: t('auth.email.placeholder'),
    required: true,
  },
  {
    name: 'password',
    type: 'password' as const,
    label: t('auth.password.label'),
    placeholder: t('auth.password.placeholder'),
    required: true,
  },
])

const schema = z.object({
  email: z.email(t('auth.validation.emailInvalid')),
  password: z.string().min(8, t('auth.validation.passwordInvalid')),
})

type Schema = z.infer<typeof schema>

function onSubmit({ data }: FormSubmitEvent<Schema>) {
  console.log(data)
}
</script>

<template>
  <UAuthForm
    ref="authForm"
    :schema="schema"
    icon="i-lucide-user-plus"
    :title="t('auth.registerDescription')"
    :submit="{
      label: t('auth.registerButton'),
    }"
    :fields="fields"
    @submit="onSubmit"
  >
    <template #validation>
      <MPasswordStrength :password="authForm?.state?.password" />
    </template>
  </UAuthForm>
</template>
