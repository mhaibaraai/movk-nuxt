import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

const autoFormNav: NavigationMenuItem = {
  label: 'AutoForm',
  icon: 'i-lucide-form-input',
  defaultOpen: true,
  children: [
    { label: 'Quickstart', to: '/auto-form/quickstart' },
    { label: 'Field Types', to: '/auto-form/field-types' },
    { label: 'Metadata', to: '/auto-form/metadata' },
    { label: 'Controls', to: '/auto-form/controls' },
    { label: 'Custom Controls', to: '/auto-form/custom-controls' },
    { label: 'Global Meta', to: '/auto-form/global-meta' },
    { label: 'Reactive', to: '/auto-form/reactive' },
    { label: 'Submit', to: '/auto-form/submit' },
    { label: 'Layout', to: '/auto-form/layout' },
    { label: 'Slots', to: '/auto-form/slots' },
    { label: 'Recipes', to: '/auto-form/recipes' }
  ]
}

const dataTableNav: NavigationMenuItem = {
  label: 'DataTable',
  icon: 'i-lucide-table',
  defaultOpen: true,
  children: [
    { label: 'Columns', to: '/data-table/columns' },
    { label: 'Rows', to: '/data-table/rows' },
    { label: 'Special Columns', to: '/data-table/special-columns' },
    { label: 'Data', to: '/data-table/data' },
    { label: 'Large Data', to: '/data-table/large-data' },
    { label: 'Tree & Style', to: '/data-table/tree-and-style' }
  ]
}

const componentsNav: NavigationMenuItem = {
  label: 'Components',
  icon: 'i-lucide-box',
  defaultOpen: true,
  children: [
    { label: 'StarRating', to: '/components/star-rating' },
    { label: 'SlideVerify', to: '/components/slide-verify' },
    { label: 'Popconfirm', to: '/components/popconfirm' },
    { label: 'MessageBox', to: '/components/message-box' },
    { label: 'ColorChooser', to: '/components/color-chooser' },
    { label: 'PillGroup', to: '/components/pill-group' },
    { label: 'DatePicker', to: '/components/date-picker' },
    { label: 'SearchForm', to: '/components/search-form' },
    { label: 'ThemePicker', to: '/components/theme-picker' },
    { label: 'Inputs · With*', to: '/components/inputs-with' },
    { label: 'AsPhoneNumberInput', to: '/components/as-phone-number-input' }
  ]
}

const composablesNav: NavigationMenuItem = {
  label: 'Composables',
  icon: 'i-lucide-puzzle',
  defaultOpen: true,
  children: [
    { label: 'useApiFetch', to: '/composables/use-api-fetch' },
    { label: 'Upload Progress', to: '/composables/use-upload-progress' },
    { label: 'Download Progress', to: '/composables/use-download-progress' },
    { label: 'useDateFormatter', to: '/composables/use-date-formatter' },
    { label: 'useTheme', to: '/composables/use-theme' },
    { label: 'useMessageBox', to: '/composables/use-message-box' }
  ]
}

const components: NavigationMenuItem[] = [autoFormNav, dataTableNav, componentsNav, composablesNav]

export const useNavigation = () => {
  const items: NavigationMenuItem[] = [
    { label: 'Home', icon: 'i-lucide-house', to: '/' }
  ]

  const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
    { id: 'links', items: items as unknown as CommandPaletteItem[] },
    { id: 'components', label: 'Navigation', items: components as unknown as CommandPaletteItem[] }
  ])

  return { components, groups, items }
}
