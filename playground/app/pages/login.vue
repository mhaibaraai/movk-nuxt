<script lang="ts" setup>
import type { AuthFormProps, ButtonProps, FormSubmitEvent } from '@nuxt/ui'
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
    type: 'text',
    label: t('auth.email.label'),
    placeholder: t('auth.email.placeholder'),
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: t('auth.password.label'),
    placeholder: t('auth.password.placeholder'),
    required: true,
  },
  {
    name: 'rememberMe',
    type: 'checkbox',
    label: t('auth.rememberMe'),
  },
] satisfies AuthFormProps['fields'])

const schema = z.object({
  email: z.email(t('auth.validation.emailInvalid')),
  password: z.string().min(8, t('auth.validation.passwordInvalid')),
})

type Schema = z.infer<typeof schema>

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}
</script>

<template>
  <UPageCard class="flex-center md:w-2/3 lg:w-1/2 xl:w-[36%]">
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
        <ULink
          to="/register"
          class="text-primary font-medium"
        >
          {{ t('auth.signUp') }}
        </ULink>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
