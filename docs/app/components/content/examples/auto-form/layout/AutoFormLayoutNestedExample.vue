<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' })
    }
  }),

  $contactInfo: afz.layout({
    class: 'space-y-4 mt-4',
    fields: {
      email: afz.email().meta({ label: '邮箱地址' }),
      $phoneLayout: afz.layout({
        class: 'grid grid-cols-3 gap-2',
        fields: {
          countryCode: afz.string().default('+86').meta({ label: '国家代码' }),
          phoneNumber: afz.string().meta({
            class: 'col-span-2',
            label: '电话号码',
            hint: '此字段占据两列宽度'
          })
        }
      })
    }
  })
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
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
