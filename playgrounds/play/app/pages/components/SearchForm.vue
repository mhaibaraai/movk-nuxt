<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).meta({ label: '姓名' }),
  status: afz.enum(['启用', '禁用', '待审核']).meta({ label: '状态' }),
  department: afz.string({ controlProps: { placeholder: '请输入部门' } }).meta({ label: '部门' }),
  keyword: afz.string({ controlProps: { placeholder: '请输入关键词' } }).meta({ label: '关键词' }),
  email: afz.email({ controlProps: { placeholder: '请输入邮箱' } }).meta({ label: '邮箱' }),
  phone: afz.string({ controlProps: { placeholder: '请输入手机号' } }).meta({ label: '手机号' }),
  role: afz.enum(['管理员', '编辑', '查看者']).meta({ label: '角色' })
})

const searchParams = ref({})
const searchLoading = ref(false)
const searchResult = ref('')

function handleSearch(value: Record<string, unknown>) {
  searchLoading.value = true
  searchResult.value = JSON.stringify(value, null, 2)

  setTimeout(() => {
    searchLoading.value = false
  }, 1000)
}

function handleReset() {
  searchResult.value = ''
}
</script>

<template>
  <div class="space-y-8 p-6">
    <div>
      <h2 class="text-xl font-semibold mb-2">
        SearchForm
      </h2>
      <p class="text-gray-500 mb-6">
        Schema 驱动的可折叠搜索表单组件，内置搜索/重置按钮、网格布局和折叠行为。
      </p>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-medium">
        基础用法（3 列，7 个字段）
      </h3>
      <MSearchForm
        v-model="searchParams"
        :schema="schema"
        :global-meta="{ size: 'xs', required: false }"
        :cols="3"
        :loading="searchLoading"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-medium">
        4 列布局，2 行可见
      </h3>
      <MSearchForm
        v-model="searchParams"
        :schema="schema"
        :cols="4"
        :visible-rows="2"
        :loading="searchLoading"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div v-if="searchResult" class="space-y-2">
      <h3 class="text-lg font-medium">
        搜索结果
      </h3>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">{{ searchResult }}</pre>
    </div>
  </div>
</template>
