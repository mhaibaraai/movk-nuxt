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
    .max(maxLength.value, `最多${maxLength.value}个字符`)
    .meta({ hint: `用户名长度应在 ${minLength.value} 到 ${maxLength.value} 个字符之间` }),

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
    <div class="mb-4 space-y-4">
      <UFormField label="最小长度">
        <USlider
          v-model="minLength"
          :min="1"
          :max="10"
          :step="1"
          tooltip
        />
      </UFormField>
      <UFormField label="最大长度">
        <USlider
          v-model="maxLength"
          :min="10"
          :max="50"
          :step="1"
          tooltip
        />
      </UFormField>
    </div>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
