<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ hint: '名字' }),
      lastName: afz.string().meta({ hint: '姓氏' })
    }
  }),

  $contactInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      email: afz.email().meta({ hint: '邮箱地址' }),
      $phoneLayout: afz.layout({
        class: 'grid grid-cols-3 gap-2',
        fields: {
          countryCode: afz.string().default('+86').meta({ hint: '国家代码', description: '默认为中国区号 +86' }),
          phoneNumber: afz.string().meta({ class: 'col-span-2', hint: '电话号码', description: '此字段占据两列布局宽度' })
        }
      })
    }
  })
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
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
