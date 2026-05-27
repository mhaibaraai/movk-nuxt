<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional()
})

function onExport() {
  console.log('导出')
}
</script>

<template>
  <MSearchForm
    :schema="schema"
    :actions="[
      { key: 'search', label: '查询', icon: 'i-lucide-search', type: 'submit', color: 'primary', variant: 'solid' },
      { key: 'reset', label: '清空', icon: 'i-lucide-rotate-ccw', color: 'error', variant: 'outline' },
      { key: 'export', label: '导出', icon: 'i-lucide-download', color: 'primary', variant: 'soft', onClick: onExport }
    ]"
  />
</template>
