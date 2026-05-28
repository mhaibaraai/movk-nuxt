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
        id: 'feedback',
        title: '反馈组件',
        icon: 'i-lucide-message-square-dot'
      },
      {
        id: 'advanced',
        title: '进阶组件',
        icon: 'i-lucide-blocks'
      },
      {
        id: 'form',
        title: '表单组件',
        icon: 'i-lucide-clipboard-list'
      }
    ],
    'auto-form': [
      {
        id: 'field-types',
        title: '字段类型',
        icon: 'i-lucide-shapes'
      },
      {
        id: 'config',
        title: '配置',
        icon: 'i-lucide-settings-2'
      },
      {
        id: 'advanced',
        title: '进阶',
        icon: 'i-lucide-blocks'
      }
    ]
  }
  return {
    categories
  }
}
