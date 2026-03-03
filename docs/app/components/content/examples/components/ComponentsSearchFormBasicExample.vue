<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用', '待审核']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入部门' } }).meta({ label: '部门' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入关键词' } }).meta({ label: '关键词' }).optional(),
  email: afz.email({ controlProps: { placeholder: '请输入邮箱' } }).meta({ label: '邮箱' }).optional()
})

const params = ref({})
const result = ref('')

function handleSearch(value: Record<string, unknown>) {
  result.value = JSON.stringify(value, null, 2)
}

function handleReset() {
  result.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <MSearchForm
      v-model="params"
      :schema="schema"
      @search="handleSearch"
      @reset="handleReset"
    />
    <pre v-if="result" class="text-sm bg-muted p-3 rounded-(--ui-radius)">{{ result }}</pre>
  </div>
</template>
