<script setup lang="ts">
const sections = [
  { label: 'AutoForm', icon: 'i-lucide-form-input', to: '/auto-form/quickstart', desc: 'Schema 驱动的表单引擎，覆盖字段类型、元数据、控件库、响应式逻辑' },
  { label: 'DataTable', icon: 'i-lucide-table', to: '/data-table/columns', desc: 'TanStack 表格封装，列/行能力、特殊列、数据流、大数据、树形' },
  { label: 'Components', icon: 'i-lucide-box', to: '/components/star-rating', desc: '展示型组件 + 业务组件，Matrix 笛卡尔积变体演示' },
  { label: 'Composables', icon: 'i-lucide-puzzle', to: '/composables/use-api-fetch', desc: 'useApiFetch 三件套、上传下载进度、日期格式化、主题、命令式弹窗' }
]
</script>

<template>
  <UPage>
    <UPageHero
      title="Movk Nuxt Playground"
      description="按能力维度组织的演示框架，覆盖组件、AutoForm、DataTable 与所有 Composables"
      orientation="horizontal"
    />
    <UPageGrid class="gap-4 sm:grid-cols-2">
      <UPageCard
        v-for="s in sections"
        :key="s.label"
        :title="s.label"
        :description="s.desc"
        :icon="s.icon"
        :to="s.to"
        variant="subtle"
      />
    </UPageGrid>
  </UPage>
</template>
