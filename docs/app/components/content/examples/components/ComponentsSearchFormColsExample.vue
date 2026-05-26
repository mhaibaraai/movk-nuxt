<script setup lang="ts">
const props = defineProps<{
  cols: string
}>()

const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional(),
  role: afz.enum(['管理员', '编辑', '查看者']).meta({ label: '角色' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})

const params = ref({})
const colsNum = computed(() => Number(props.cols))
</script>

<template>
  <MSearchForm v-model="params" :schema="schema" :cols="colsNum" />
</template>
