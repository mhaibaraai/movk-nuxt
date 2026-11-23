import { defineAsyncComponent } from 'vue'
import type { MessageBoxProps } from '../types/components/message-box'
import { useOverlay } from '#imports'
import type { OmitByKey } from '@movk/core'

// 直接按文件懒加载：`#components` 中的组件名随 `prefix` 变化，不能写死
const MessageBox = defineAsyncComponent(() => import('../components/MessageBox.vue'))

export function useMessageBox() {
  const overlay = useOverlay()

  function createInstance() {
    return overlay.create(MessageBox, { destroyOnClose: true })
  }

  async function alert(options: OmitByKey<MessageBoxProps, 'mode'>) {
    await createInstance().open({ ...options, mode: 'alert' })
  }

  async function confirm(options: OmitByKey<MessageBoxProps, 'mode'>): Promise<boolean> {
    const result = await createInstance().open({ ...options, mode: 'confirm' })
    return result ?? false
  }

  return { alert, confirm }
}
