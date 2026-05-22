import type { VNode } from 'vue'
import type { ClassNameValue } from '../shared'
import type { IconProps } from '@nuxt/ui'

export interface SlideVerifyProps {
  id?: string
  name?: string
  /**
   * 尺寸大小
   * @defaultValue 'md'
   */
  size?: string
  /** 是否禁用 */
  disabled?: boolean
  /**
   * 待滑动时的提示文本
   * @defaultValue '请向右滑动验证'
   */
  text?: string
  /**
   * 验证成功时的提示文本
   * @defaultValue '验证成功'
   */
  successText?: string
  /**
   * 滑块图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-chevrons-right'
   */
  icon?: IconProps['name']
  /**
   * 验证成功时的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-check'
   */
  successIcon?: IconProps['name']
  /**
   * 完成验证所需的阈值百分比（0-1）
   * @defaultValue 0.9
   */
  threshold?: number
  class?: ClassNameValue
  ui?: Record<string, ClassNameValue>
}

export interface SlideVerifyEmits {
  success: []
  dragStart: []
  dragEnd: [success: boolean]
}

export interface SlideVerifySlots {
  slider?(props: { verified?: boolean, progress: number }): VNode[]
}
