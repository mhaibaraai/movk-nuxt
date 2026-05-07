import type { MessageBoxProps } from '../types/components/message-box'
import { useOverlay } from '#imports'
import { LazyMMessageBox } from '#components'
import type { OmitByKey } from '@movk/core'

export function useMessageBox() {
  const overlay = useOverlay()

  function createInstance() {
    return overlay.create(LazyMMessageBox, { destroyOnClose: true })
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
