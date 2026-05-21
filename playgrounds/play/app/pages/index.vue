<script setup lang="ts">
const sections = [
  { label: 'AutoForm', icon: 'i-lucide-form-input', to: '/auto-form/quickstart', desc: '用 Zod Schema 生成字段、装配控件并驱动联动' },
  { label: 'DataTable', icon: 'i-lucide-table', to: '/data-table/columns', desc: '基于 TanStack Table 的列定义、行状态、服务端数据与树形结构' },
  { label: 'API', icon: 'i-lucide-cable', to: '/api/quickstart', desc: '多端点、数据解包、Toast 决策、错误分类与认证拦截' },
  { label: 'Components', icon: 'i-lucide-box', to: '/components/star-rating', desc: '展示型与业务型组件，按 Matrix 组合呈现属性变体' },
  { label: 'Composables', icon: 'i-lucide-puzzle', to: '/composables/use-upload-progress', desc: '传输进度、日期格式化、主题导出与命令式弹窗' }
]
</script>

<template>
  <UPage>
    <UPageHero
      title="Movk Nuxt 能力演示"
      description="按真实使用场景组织模块示例，覆盖组件、AutoForm、DataTable 与 Composables 的能力边界"
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
