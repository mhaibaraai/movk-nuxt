import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MessageBox from '../../src/runtime/components/MessageBox.vue'

describe('MessageBox', () => {
  it('confirm 模式渲染确认与取消按钮', async () => {
    const wrapper = await mountSuspended(MessageBox, {
      props: { open: true, mode: 'confirm', title: 'Title' },
      attachTo: document.body
    })

    const text = document.body.textContent ?? ''
    expect(text).toContain('Title')
    expect(document.body.querySelectorAll('button').length).toBeGreaterThanOrEqual(2)
    wrapper.unmount()
  })
})
