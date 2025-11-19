<script lang="ts" setup>
import { UIcon } from '#components'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

type Country = {
  name: string
  code: string
  emoji: string
}

const { data: countries, execute, pending } = await useLazyFetch<Country[]>('https://ui.nuxt.com/api/countries.json', {
  immediate: false
})

const schema = afz.object({
  countrie: afz.object({
    name: afz.string(),
    code: afz.string(),
    emoji: afz.string()
  }, {
    type: 'selectMenu',
    controlProps: computed(() => ({
      'items': countries.value,
      'loading': pending.value,
      'labelKey': 'name',
      'searchInput': { icon: 'i-lucide-search' },
      'onUpdate:open': () => {
        if (!countries.value?.length) {
          execute()
        }
      }
    })),
    controlSlots: {
      'leading': ({ modelValue, ui }) => {
        if (modelValue) {
          return h('span', { class: 'size-5 text-center' }, modelValue?.emoji)
        }
        return h(UIcon, { name: 'i-lucide-earth', class: ui.leadingIcon() })
      },
      'item-leading': ({ item }: { item: Country }) => {
        return h('span', { class: 'size-5 text-center' }, item?.emoji)
      }
    }
  }).meta({ label: '选择国家', hint: '下拉加载选项' })
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
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
