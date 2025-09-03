<script lang="ts" setup>
import type { ButtonProps, FormSubmitEvent } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { z } from 'zod/v4'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
useSeoMeta({
  title: computed(() => t('auth.loginTitle')),
})

const providers = ref([
  {
    label: 'Github',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    size: 'md',
    onClick: () => {
      console.log('Login with Github')
    },
  },
] satisfies ButtonProps[])

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
  {
    name: 'rememberMe',
    type: 'checkbox' as const,
    label: t('auth.rememberMe'),
  },
])

const schema = z.object({
  email: z.email(t('auth.validation.emailInvalid')),
  password: z.string().min(8, t('auth.validation.passwordInvalid')),
})

type Schema = z.infer<typeof schema>

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}

const { execute, data } = useApiFetch('/auth/login', {
  method: 'POST',
  body: {
    email: 'mhaibaraai@gmail.com',
    password: 'ChangeMe_123!',
  },
  onResponse({ response }) {
    console.log(response)
  },
})
</script>

<template>
  {{ data }}
  <UButton @click="execute()">
    Login
  </UButton>
  <UAuthForm
    :title="t('auth.loginDescription')"
    :providers="providers"
    :fields="fields"
    :schema="schema"
    :submit-button="{ label: t('auth.loginButton') }"
    @submit="onSubmit"
  >
    <template #description>
      {{ t('auth.registerLink') }}
      <ULink to="/register" class="text-primary font-medium">
        {{ t('auth.signUp') }}
      </ULink>
    </template>
  </UAuthForm>
</template>
