<script setup lang="ts">
import type { AutoFormAsyncItems } from '@movk/nuxt'

const { afz } = useAutoForm()
const cities = { France: ['Lyon', 'Paris'], Japan: ['Kyoto', 'Tokyo'] }
const cityOptions: AutoFormAsyncItems = {
  deps: state => state.country,
  async load({ state }) {
    return state.country === 'Japan' ? cities.Japan : cities.France
  }
}
const schema = afz.object({
  country: afz.enum(['France', 'Japan']).default('France'),
  city: afz.string({ type: 'selectMenu' }).optional().meta({ type: 'selectMenu', asyncItems: cityOptions }),
  tasks: afz.array(afz.string()).min(1).max(4).meta({ sortable: true, duplicable: true })
})
const state = ref({ country: 'France' as 'France' | 'Japan', tasks: ['Draft', 'Review'] })
</script>

<template>
  <MAutoForm v-model="state" :schema="schema" :submit="false" />
</template>
