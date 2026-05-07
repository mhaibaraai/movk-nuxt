import type { MaybeComputedElementRef } from '@vueuse/core'
import type { DeepReadonly, Ref } from 'vue'
import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { readonly, ref, toValue, watchEffect } from 'vue'

interface UseOverflowDetectionReturn {
  /**
   * 元素当前是否被截断（内容超出可视区域）
   */
  overflowed: DeepReadonly<Ref<boolean>>
  /**
   * 手动触发一次重新检测
   */
  check: () => void
}

/**
 * 检测元素文本内容是否被截断
 *
 * 自动追踪尺寸变化（ResizeObserver）和内容变化（MutationObserver），
 * 并根据元素的 computed style 自动推断单行/多行截断模式。调用方只需
 * 在元素上正确应用 truncate / line-clamp CSS，无需额外配置。
 *
 * @param target 目标元素引用（支持 ref / 模板 ref / getter）
 * @returns `overflowed` 响应式状态 + 手动 `check` 方法
 */
export function useOverflowDetection(
  target: MaybeComputedElementRef<HTMLElement | null | undefined>
): UseOverflowDetectionReturn {
  const overflowed = ref(false)

  function check(): void {
    if (typeof window === 'undefined') return
    const el = toValue(target)
    if (!el) return
    overflowed.value = measureOverflow(el)
  }

  // target 由 null 变为元素时同步触发首次检测
  watchEffect(() => {
    if (toValue(target)) check()
  })

  // 容器尺寸变化（列宽调整、窗口 resize 等）
  useResizeObserver(target, check)

  // 内容变化（文本节点更新等）
  useMutationObserver(target, check, {
    childList: true,
    characterData: true,
    subtree: true
  })

  return {
    overflowed: readonly(overflowed),
    check
  }
}

/**
 * 根据元素 computed style 自动选择测量策略
 *
 * - `display: -webkit-box` + `webkit-line-clamp` → 多行模式，测高
 * - `white-space: nowrap` + 截断 → 单行模式，测宽
 * - 其他 → 通用 scroll vs client 比较
 */
function measureOverflow(el: HTMLElement): boolean {
  const cs = window.getComputedStyle(el)

  if (isLineClamp(cs)) {
    return measureHeightWithProbe(el, cs)
  }

  if (isSingleLineEllipsis(cs)) {
    return measureWidthWithProbe(el, cs)
  }

  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
}

function isLineClamp(cs: CSSStyleDeclaration): boolean {
  return (
    cs.display === '-webkit-box'
    && cs.webkitLineClamp !== 'none'
    && cs.webkitLineClamp !== ''
    && cs.webkitLineClamp !== '0'
  )
}

function isSingleLineEllipsis(cs: CSSStyleDeclaration): boolean {
  return (
    cs.whiteSpace === 'nowrap'
    && (cs.textOverflow === 'ellipsis' || cs.overflow === 'hidden')
  )
}

/**
 * 单行场景：用屏幕外探针测量文本自然宽度
 *
 * 绕过 table cell 内 overflow:hidden 导致 scrollWidth 不可靠的浏览器行为
 */
function measureWidthWithProbe(el: HTMLElement, cs: CSSStyleDeclaration): boolean {
  const probe = document.createElement('span')
  probe.style.cssText = 'position:fixed;top:-9999px;visibility:hidden;white-space:nowrap;pointer-events:none'
  probe.style.font = cs.font
  probe.style.letterSpacing = cs.letterSpacing
  probe.textContent = el.textContent ?? ''
  document.body.appendChild(probe)
  const naturalWidth = probe.getBoundingClientRect().width
  probe.remove()
  return naturalWidth > el.getBoundingClientRect().width
}

/**
 * 多行场景：用屏幕外探针测量文本自然高度
 *
 * 绕过 Chrome 中 -webkit-line-clamp 元素 scrollHeight === clientHeight 的已知 bug
 */
function measureHeightWithProbe(el: HTMLElement, cs: CSSStyleDeclaration): boolean {
  const { width, height } = el.getBoundingClientRect()
  if (width <= 0 || height <= 0) return false
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;top:-9999px;visibility:hidden;pointer-events:none;width:${width}px;overflow:visible;white-space:normal`
  probe.style.font = cs.font
  probe.style.letterSpacing = cs.letterSpacing
  probe.style.lineHeight = cs.lineHeight
  probe.style.wordBreak = cs.wordBreak
  probe.style.overflowWrap = cs.overflowWrap
  probe.textContent = el.textContent ?? ''
  document.body.appendChild(probe)
  const naturalHeight = probe.getBoundingClientRect().height
  probe.remove()
  return naturalHeight > height
}
