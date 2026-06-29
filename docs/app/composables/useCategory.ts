export function useCategory() {
  const { t } = useI18n()

  const categories = computed(() => ({
    'getting-started': [
      {
        id: 'ai',
        title: t('category.gettingStarted.ai'),
        icon: 'i-lucide-bot'
      }
    ],
    'components': [
      {
        id: 'input',
        title: t('category.components.input'),
        icon: 'i-lucide-pencil-line'
      },
      {
        id: 'feedback',
        title: t('category.components.feedback'),
        icon: 'i-lucide-message-square-dot'
      },
      {
        id: 'advanced',
        title: t('category.components.advanced'),
        icon: 'i-lucide-blocks'
      },
      {
        id: 'form',
        title: t('category.components.form'),
        icon: 'i-lucide-clipboard-list'
      }
    ],
    'auto-form': [
      {
        id: 'field-types',
        title: t('category.autoForm.fieldTypes'),
        icon: 'i-lucide-shapes'
      },
      {
        id: 'config',
        title: t('category.autoForm.config'),
        icon: 'i-lucide-settings-2'
      },
      {
        id: 'advanced',
        title: t('category.autoForm.advanced'),
        icon: 'i-lucide-blocks'
      }
    ]
  }))

  return {
    categories
  }
}
