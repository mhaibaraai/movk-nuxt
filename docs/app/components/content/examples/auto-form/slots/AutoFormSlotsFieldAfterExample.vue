<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  address: afz.object({
    street: afz.string().meta({ label: '街道' }),
    city: afz.string().meta({ label: '城市' }),
    zipCode: afz.string().meta({ label: '邮编' })
  }).meta({ label: '地址信息', collapsible: { defaultOpen: true } }),

  skills: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: { icon: 'i-lucide-briefcase' }
  })
    .default(['Vue', 'TypeScript', 'Zod', 'Nuxt', 'UI'])
    .meta({ label: '技能标签' })
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
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <template #field-after:address="{ value }">
        <UAlert
          v-if="value && value.street && value.city && value.zipCode"
          color="success"
          variant="subtle"
          icon="i-lucide-check-circle"
          class="mt-4"
        >
          <template #title>
            地址验证通过
          </template>
          <template #description>
            完整地址: {{ value.street }}, {{ value.city }}, {{ value.zipCode }}
          </template>
        </UAlert>
      </template>

      <template #field-hint:skills="{ value }">
        <UBadge
          v-if="value && value.length >= 5"
          color="success"
          variant="subtle"
          icon="i-lucide-award"
        >
          技能丰富
        </UBadge>
      </template>
    </MAutoForm>
  </UCard>
</template>
