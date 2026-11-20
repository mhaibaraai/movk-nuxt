<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const schema = afz.object({
  pinned: afz.boolean({
    type: 'toggle',
    controlProps: { label: '置顶', activeVariant: 'solid' }
  }).default(false).meta({ label: '文章设置' })
})

const state = reactive<z.input<typeof schema>>({})
</script>

<template>
  <MAutoForm v-model="state" :schema="schema" :submit="false" />
</template>
