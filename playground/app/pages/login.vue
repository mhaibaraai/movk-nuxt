<script lang="ts" setup>
import type { AuthFormProps } from '#movk/types'
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod/v4'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
useSeoMeta({
  title: computed(() => t('auth.loginTitle')),
})

const providers: AuthFormProps['providers'] = [
  {
    label: 'Github',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    size: 'md',
    onClick: () => {
      console.log('Login with Github')
    },
  },
]

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
] as AuthFormProps['fields'])

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
  <div class="gap-4 flex-center md:w-2/3 lg:w-1/2 xl:w-[36%]">
    <MAuthForm
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
    </MAuthForm>
  </div>
</template>

<style lang="scss" scoped>
.login-background {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--ui-primary), transparent 70%) 0%,
    color-mix(in srgb, var(--ui-primary), transparent 80%) 25%,
    color-mix(in srgb, var(--ui-primary), transparent 85%) 50%,
    color-mix(in srgb, var(--ui-primary), transparent 90%) 75%,
    transparent 100%
  );

  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  animation: breathing 4s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes breathing {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

html.dark .login-background {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--ui-primary), transparent 75%) 0%,
    color-mix(in srgb, var(--ui-primary), transparent 82%) 25%,
    color-mix(in srgb, var(--ui-primary), transparent 88%) 50%,
    color-mix(in srgb, var(--ui-primary), transparent 92%) 75%,
    transparent 100%
  );
}
</style>
