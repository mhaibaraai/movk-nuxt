<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  profile: afz.object({
    firstName: afz.string().meta({ label: '名' }),
    lastName: afz.string().meta({ label: '姓' }),
    age: afz.number().min(0).meta({ label: '年龄' })
  }).meta({ label: '个人资料' }),
  skills: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: { icon: 'i-lucide-briefcase' }
  })
    .default(['编程', '设计'])
    .meta({ label: '技能列表' })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard>
    <MAutoForm
      :global-meta="{ collapsible: { defaultOpen: true } }"
      :schema="schema"
      :state="form"
      @submit="onSubmit"
    >
      <template #field-before:profile>
        <USeparator icon="i-lucide-circle-user" label="个人资料" />
      </template>

      <template #field-description:skills="{ value }">
        {{ value?.length || 0 }} 项已添加技能
      </template>
    </MAutoForm>
  </UCard>
</template>
