<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const schema = afz.object({
  keyword: afz.string({ controlProps: { placeholder: '搜索关键词' } }).optional(),
  category: afz.enum(['all', 'electronics', 'clothing', 'food']).default('all'),
  priceMin: afz.number().min(0).optional(),
  priceMax: afz.number().min(0).optional(),
  inStock: afz.boolean({ type: 'switch' }).default(false),
  tags: afz.array(afz.string(), {
    type: 'inputTags',
    controlProps: { placeholder: '添加标签筛选' }
  }).optional()
}).refine(
  data => !data.priceMin || !data.priceMax || data.priceMin <= data.priceMax,
  { message: '最小价格不能大于最大价格', path: ['priceMax'] }
)

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})
</script>

<template>
  <Navbar />
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" :submit-button="false" />
  </Matrix>
</template>
