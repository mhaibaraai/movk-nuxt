<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const countryOptions = ['CN', 'US', 'JP'] as const
type CountryCode = typeof countryOptions[number]

const cityItemsByCountry: Record<CountryCode, string[]> = {
  CN: ['北京', '上海', '广州'],
  US: ['New York', 'San Francisco', 'Seattle'],
  JP: ['Tokyo', 'Osaka', 'Kyoto']
}

const schema = afz.object({
  country: afz.enum(countryOptions).default('CN').meta({ label: '国家' }),
  city: afz.enum([], {
    type: 'enum',
    controlProps: ({ state }) => ({
      items: cityItemsByCountry[(state.country as CountryCode | undefined) ?? 'CN']
    })
  }).meta({ label: '城市', hint: '选项随国家变化，切换国家后会清空已选城市' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})

watch(() => state.country, () => {
  state.city = undefined
})
</script>

<template>
  <MAutoForm :schema="schema" :state="state" />
</template>
