<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  skills: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: {
      placeholder: '添加技能标签',
      deleteIcon: 'i-lucide-trash',
      avatar: {
        src: 'https://github.com/vuejs.png'
      }
    }
  }).default(['Vue', 'TypeScript']),

  interests: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: { placeholder: '添加兴趣', loading: true }
  }).min(1),

  keywords: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: { disabled: true }
  }).default(['Nuxt', 'AutoForm'])
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
