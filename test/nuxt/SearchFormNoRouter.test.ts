import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import SearchForm from '../../src/runtime/components/SearchForm.vue'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'

vi.mock('#build/movk-router', () => ({ supportsSearchQuery: false }))

describe('SearchForm without query routing', () => {
  it('仍可提交搜索表单', async () => {
    const { afz } = useAutoForm()
    const onSubmit = vi.fn()
    const wrapper = await mountSuspended(SearchForm, {
      props: {
        schema: afz.object({ keyword: afz.string() }),
        modelValue: { keyword: 'example' },
        syncQuery: true,
        onSubmit
      } as never
    })
    try {
      const vm = wrapper.vm as unknown as { submit: () => Promise<void> }
      await vm.submit()
      expect(onSubmit.mock.calls[0]?.[0].data).toEqual({ keyword: 'example' })
      expect(wrapper.emitted('query-restore')).toBeUndefined()
    }
    finally {
      wrapper.unmount()
    }
  })
})
