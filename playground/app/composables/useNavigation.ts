import type { NavigationMenuItem } from '@nuxt/ui'

const autoFormNav: NavigationMenuItem = {
  label: 'AutoForm',
  icon: 'i-lucide-book-marked',
  defaultOpen: true,
  children: [
    {
      label: 'Getting Started',
      defaultOpen: true,
      children: [
        { label: 'Basic', to: '/auto-form/getting-started/basic' },
        { label: 'Validation', to: '/auto-form/getting-started/validation' },
        { label: 'Default Values', to: '/auto-form/getting-started/default-values' },
        { label: 'Optional Fields', to: '/auto-form/getting-started/optional' }
      ]
    },
    {
      label: 'Field Types',
      defaultOpen: true,
      children: [
        { label: 'String', to: '/auto-form/field-types/string' },
        { label: 'Number', to: '/auto-form/field-types/number' },
        { label: 'Boolean', to: '/auto-form/field-types/boolean' },
        { label: 'Date', to: '/auto-form/field-types/date' },
        { label: 'Enum', to: '/auto-form/field-types/enum' },
        { label: 'File', to: '/auto-form/field-types/file' },
        { label: 'Array', to: '/auto-form/field-types/array' },
        { label: 'Nested', to: '/auto-form/field-types/nested' }
      ]
    },
    {
      label: 'Controls',
      defaultOpen: true,
      children: [
        { label: 'WithClear', to: '/auto-form/controls/with-clear' },
        { label: 'WithPasswordToggle', to: '/auto-form/controls/with-password-toggle' },
        { label: 'WithCopy', to: '/auto-form/controls/with-copy' },
        { label: 'WithCharacterLimit', to: '/auto-form/controls/with-character-limit' },
        { label: 'ColorChooser', to: '/auto-form/controls/color-chooser' },
        { label: 'InputTags', to: '/auto-form/controls/input-tags' },
        { label: 'SelectMenu', to: '/auto-form/controls/select-menu' },
        { label: 'InputMenu', to: '/auto-form/controls/input-menu' },
        { label: 'CheckboxGroup', to: '/auto-form/controls/checkbox-group' },
        { label: 'RadioGroup', to: '/auto-form/controls/radio-group' }
      ]
    },
    {
      label: 'Layout',
      defaultOpen: true,
      children: [
        { label: 'Basic', to: '/auto-form/layout/basic' },
        { label: 'Grid', to: '/auto-form/layout/grid' },
        { label: 'Nested', to: '/auto-form/layout/nested' },
        { label: 'Multi-column', to: '/auto-form/layout/multi-column' },
        { label: 'Tabs', to: '/auto-form/layout/tabs' }
      ]
    },
    {
      label: 'Advanced',
      defaultOpen: true,
      children: [
        { label: 'Conditional', to: '/auto-form/advanced/conditional' },
        { label: 'Dynamic Arrays', to: '/auto-form/advanced/dynamic-arrays' },
        { label: 'Custom Controls', to: '/auto-form/advanced/custom-controls' },
        { label: 'Async Validation', to: '/auto-form/advanced/async-validation' },
        { label: 'Dependencies', to: '/auto-form/advanced/dependencies' },
        { label: 'Collapsible', to: '/auto-form/advanced/collapsible' },
        { label: 'Slots', to: '/auto-form/advanced/slots' },
        { label: 'Reactive Props', to: '/auto-form/advanced/reactive-props' }
      ]
    },
    {
      label: 'Examples',
      defaultOpen: true,
      children: [
        { label: 'Login', to: '/auto-form/examples/login' },
        { label: 'Registration', to: '/auto-form/examples/registration' },
        { label: 'Profile', to: '/auto-form/examples/profile' },
        { label: 'Product', to: '/auto-form/examples/product' },
        { label: 'Survey', to: '/auto-form/examples/survey' },
        { label: 'Filter', to: '/auto-form/examples/filter' }
      ]
    },
    {
      label: 'Showcase',
      defaultOpen: true,
      children: [
        { label: 'All Features', to: '/auto-form/showcase/all-features' }
      ]
    }
  ]
}

const components: NavigationMenuItem[] = [autoFormNav]

export const useNavigation = () => {
  const items = [{ label: 'Home', icon: 'i-lucide-house', to: '/' }]

  const groups = computed(() => [
    { id: 'links', items },
    { id: 'components', label: 'Components', items: components }
  ])

  return {
    components,
    groups,
    items
  }
}
