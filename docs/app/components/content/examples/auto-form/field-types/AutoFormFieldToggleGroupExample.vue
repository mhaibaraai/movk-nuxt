<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const schema = afz.object({
  period: afz.enum(['日', '周', '月'], {
    type: 'toggleGroup',
    controlProps: { attached: true }
  }).optional().meta({ label: '统计周期' }),
  formats: afz.array(afz.enum(['bold', 'italic', 'underline']), {
    type: 'toggleGroup',
    controlProps: {
      type: 'multiple',
      items: [
        { label: '加粗', value: 'bold' },
        { label: '斜体', value: 'italic' },
        { label: '下划线', value: 'underline' }
      ]
    }
  }).default([]).meta({ label: '文字格式' })
})

const state = reactive<z.input<typeof schema>>({})
</script>

<template>
  <MAutoForm v-model="state" :schema="schema" :submit="false" />
</template>
