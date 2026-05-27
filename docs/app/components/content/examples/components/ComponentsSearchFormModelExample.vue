<script setup lang="ts">
import type z from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用', '待审核']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入关键词' } }).meta({ label: '关键词' }).optional()
})

const state = ref<Partial<z.output<typeof schema>>>({
  name: '张三',
  status: '启用'
})
</script>

<template>
  <div class="space-y-4">
    <MSearchForm v-model="state" :schema="schema" />
    <pre class="text-sm bg-muted p-3 rounded-(--ui-radius)">{{ JSON.stringify(state, null, 2) }}</pre>
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
      @click="state = { name: '李四', status: '禁用', keyword: '测试' }"
    >
      外部设值
    </UButton>
  </div>
</template>
