<script lang="ts" setup>
import type { FormSubmitEvent, InputMenuItem } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' }
] satisfies InputMenuItem[]

const schema = afz.object({
  fruit: afz.string({
    type: 'inputMenu',
    controlProps: {
      items,
      valueKey: 'value'
    }
  })
    .meta({
      label: '输入菜单',
      placeholder: '输入或选择水果',
      hint: '支持输入和下拉选择'
    })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
