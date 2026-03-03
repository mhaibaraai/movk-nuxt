<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional()
})

const params = ref({})
</script>

<template>
  <MSearchForm
    v-model="params"
    :schema="schema"
    search-text="查询"
    reset-text="清空"
    expand-text="更多"
    collapse-text="收起"
    :search-button-props="{ color: 'primary', variant: 'solid' }"
    :reset-button-props="{ color: 'error', variant: 'outline' }"
  />
</template>
