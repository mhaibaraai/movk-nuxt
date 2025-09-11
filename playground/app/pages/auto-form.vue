<script lang="ts" setup>
// const z = createAutoFormZ()
import { z } from 'zod/v4'

const schema = z.object({
  stringT: z.string().meta({}),
  numberT: z.number().meta({}),
  booleanT: z.boolean().meta({}),
  enumT: z.enum(['1', '2', '3']).meta({}),
  dateT: z.date().meta({}),
  objectT: z.object({
    name: z.string(),
    age: z.number(),
  }).meta({}),
})

const state = ref<z.infer<typeof schema>>({})
</script>

<template>
  <pre>{{ state }}</pre>
  <UCard>
    <MAutoForm v-model="state" :schema="schema" class="space-y-4" />
  </UCard>
</template>
