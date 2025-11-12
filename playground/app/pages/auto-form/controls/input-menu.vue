<script lang="ts" setup>
import type { FormSubmitEvent, InputMenuItem } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const items = ref([
  { type: 'label', label: '水果' },
  'Apple',
  'Banana',
  'Orange',
  { type: 'separator' },
  { type: 'label', label: '蔬菜' },
  'Carrot',
  'Tomato'
] satisfies InputMenuItem[])

const schema = afz.object({
  food: afz.string({
    type: 'inputMenu',
    controlProps: ({ value }) => ({
      items: items.value,
      createItem: true,
      onCreate: (item: string) => {
        items.value.push(item)
        value.push(item)
      }
    })
  }),

  multipleFoods: afz.array(afz.string(), {
    type: 'inputMenu',
    controlProps: {
      items: items.value,
      multiple: true
    }
  }).default(['Apple'])
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
  </UCard>
</template>
