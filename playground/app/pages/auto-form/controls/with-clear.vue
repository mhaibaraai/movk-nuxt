<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  normalInput: afz.string().meta({ hint: '普通输入框' }),
  withClear: afz.string({ type: 'withClear' }).default('可以清除').meta({ hint: '带清除按钮的输入框' }),
  clearWithIcon: afz.string({
    type: 'withClear',
    controlProps: {
      icon: 'i-lucide-mail',
      placeholder: '输入邮箱地址'
    }
  }).meta({ hint: '带清除按钮且带图标的输入框' })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
