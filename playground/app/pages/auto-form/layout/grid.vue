<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $layout: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' }),
      email: afz.email().meta({ class: 'col-span-2', hint: '邮箱地址', description: '此字段占据两列布局宽度' }),
      phone: afz.string().meta({ label: '电话' }),
      age: afz.number().int().min(0).meta({ label: '年龄' })
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
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
