import type { SearchFormAction } from '../../types/auto-form/search-form'

export const DEFAULT_SEARCH_ACTIONS: SearchFormAction[] = [
  { key: 'search', label: '搜索', icon: 'i-lucide-search', type: 'submit' },
  { key: 'reset', label: '重置', icon: 'i-lucide-rotate-ccw', color: 'neutral', variant: 'outline' }
]
