export function useCategory() {
  const categories = {
    'auto-form': [
      {
        id: 'core-concepts',
        title: '核心概念',
        icon: 'i-lucide-cog'
      },
      {
        id: 'field-types',
        title: '字段类型',
        icon: 'i-lucide-library'
      },
      {
        id: 'layout-system',
        title: '布局系统',
        icon: 'i-lucide-layout-grid'
      },
      {
        id: 'advanced',
        title: '进阶功能',
        icon: 'i-lucide-sparkles'
      },
      {
        id: 'customization',
        title: '自定义与扩展',
        icon: 'i-lucide-shapes'
      }
    ]
  }
  return {
    categories
  }
}
