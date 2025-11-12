<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const minLength = ref(3)
const maxLength = ref(20)

const schema = computed(() => afz.object({
  username: afz.string()
    .min(minLength.value, `至少${minLength.value}个字符`)
    .max(maxLength.value, `最多${maxLength.value}个字符`),

  acceptTerms: afz.boolean({
    controlProps: computed(() => ({
      label: `我已阅读并同意 ${new Date().getFullYear()} 年服务条款`
    }))
  })
}))

type Schema = z.output<typeof schema.value>

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
    <div class="mb-4 space-y-2">
      <div>
        <label class="text-sm">最小长度: {{ minLength }}</label>
        <input
          v-model.number="minLength"
          type="range"
          min="1"
          max="10"
          class="w-full"
        >
      </div>
      <div>
        <label class="text-sm">最大长度: {{ maxLength }}</label>
        <input
          v-model.number="maxLength"
          type="range"
          min="10"
          max="50"
          class="w-full"
        >
      </div>
    </div>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
