export function useCategory() {
  const categories = {
    'getting-started': [
      {
        id: 'ai',
        title: 'AI 集成',
        icon: 'i-lucide-bot'
      }
    ],
    'components': [
      {
        id: 'input',
        title: '输入框',
        icon: 'i-lucide-pencil-line'
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
