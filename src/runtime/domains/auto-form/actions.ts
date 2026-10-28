import type { SearchFormAction } from '../../types/auto-form/search-form'
import type { MovkTranslator } from '../../composables/useMovkLocale'

export function createDefaultSearchActions(t: MovkTranslator): SearchFormAction[] {
  return [
    { key: 'search', label: t('searchForm.search'), icon: 'i-lucide-search', type: 'submit' },
    { key: 'reset', label: t('searchForm.reset'), icon: 'i-lucide-rotate-ccw', color: 'neutral', variant: 'outline' }
  ]
}
