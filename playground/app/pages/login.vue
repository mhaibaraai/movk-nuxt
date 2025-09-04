<script lang="ts" setup>
import type { ButtonProps, FormSubmitEvent } from '@nuxt/ui'
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
  password: z.string(t('auth.validation.passwordInvalid')).min(8, t('auth.validation.passwordInvalid')),
  rememberMe: z.boolean().default(false),
})

type Schema = z.infer<typeof schema>

const state = ref<Schema>({
  email: '',
  password: '',
  rememberMe: false,
})

const { execute } = useApiFetch('/auth/login', {
  method: 'POST',
  body: state.value,
})

function onSubmit(payload: FormSubmitEvent<Schema>) {
  state.value = payload.data
  execute()
}
</script>

<template>
  <UAuthForm
    icon="i-lucide-user"
    :title="t('auth.loginDescription')"
    :providers="providers"
    :fields="fields"
    :schema="schema"
    :submit="{ label: t('auth.loginButton') }"
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
