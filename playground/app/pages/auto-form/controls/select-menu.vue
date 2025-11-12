<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const { data: countries } = await useFetch('https://restcountries.com/v3.1/all', {
  transform: (data: any[]) => data.slice(0, 50).map(c => ({
    label: c.name.common,
    value: c.cca2,
    flag: c.flag
  }))
})

const schema = afz.object({
  country: afz.string({
    type: 'selectMenu',
    controlProps: computed(() => ({
      items: countries.value || [],
      searchInput: { icon: 'i-lucide-search' }
    }))
  }),

  multipleCountries: afz.array(afz.string(), {
    type: 'selectMenu',
    controlProps: computed(() => ({
      items: countries.value || [],
      multiple: true
    }))
  }).optional()
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
