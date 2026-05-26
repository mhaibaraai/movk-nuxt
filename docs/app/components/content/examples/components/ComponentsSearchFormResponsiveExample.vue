<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用', '待审核']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional(),
  email: afz.email({ controlProps: { placeholder: '请输入' } }).meta({ label: '邮箱' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})

const params = ref({})
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm text-muted">
      调整浏览器窗口宽度查看效果：sm=1, md=2, lg=3, xl=4
    </p>
    <MSearchForm
      v-model="params"
      :schema="schema"
      :cols="{ sm: 1, md: 2, lg: 3, xl: 4 }"
    />
  </div>
</template>
