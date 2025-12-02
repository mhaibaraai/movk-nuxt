export function useCategory() {
  const categories = {
    components: [
      {
        id: 'input',
        title: '输入框',
        icon: 'lucide-pencil-line'
      },
      {
        id: 'advanced',
        title: '进阶组件',
        icon: 'i-lucide-blocks'
      }
    ]
  }
  return {
    categories
  }
}
