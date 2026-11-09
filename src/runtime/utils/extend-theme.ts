import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { SlotClass } from '@nuxt/ui'
import { tv } from '@nuxt/ui/utils/tv'
import { useComponentOverrides } from '@nuxt/ui/composables/useComponentProps'
import type * as themes from '../themes'

type SlotsLike = { slots: Record<string, unknown> }
type SlotFn = (opts: { class?: unknown }) => string | undefined
type SlotMap = Record<string, SlotFn>
type MergeParams = {
  ui?: Record<string, SlotClass | SlotClass[]>
  variants?: Record<string, unknown>
}

export type MovkThemeKey = keyof typeof themes

type BaseKeys<P extends SlotsLike> = string & keyof P['slots']
type ExtraKeys<P extends SlotsLike, M extends SlotsLike> = string & Exclude<keyof M['slots'], keyof P['slots']>
type AllKeys<P extends SlotsLike, M extends SlotsLike> = string & (keyof P['slots'] | keyof M['slots'])

interface ExtendedTv<P extends SlotsLike, M extends SlotsLike> {
  extendUi: ComputedRef<Record<AllKeys<P, M>, string>>
  baseUi: ComputedRef<Record<BaseKeys<P>, string>>
  extraUi: ComputedRef<Record<ExtraKeys<P, M>, string>>
}

/**
 * 合并 movk 主题、`app.config.ui.<key>` 与各级 `<UTheme>` 覆盖以及组件 `ui` prop，
 * 并按被包装组件（parentTheme）的原生 slot 拆分结果
 */
export function useExtendedTv<P extends SlotsLike, M extends SlotsLike>(
  parentTheme: P,
  movkTheme: M,
  key: MovkThemeKey,
  getParams: () => MergeParams = () => ({})
): ExtendedTv<P, M> {
  // 父 theme 只用于划分被包装组件的原生 slot 边界
  const parentSlotKeys = new Set(Object.keys(parentTheme.slots))
  // 补齐父 slot key，让最终 ui 同时包含父组件和扩展组件的 slot
  const theme = {
    ...movkTheme,
    slots: { ...Object.fromEntries([...parentSlotKeys].map(slot => [slot, ''])), ...movkTheme.slots }
  }
  const overrides = useComponentOverrides((ui: Record<string, any>) => ui[key])

  const extendUi = computed(() => {
    const { ui: uiOverride = {}, variants } = getParams()
    const cls = (tv(theme as never, overrides.value) as unknown as (v?: unknown) => SlotMap)(variants)

    // 主题之外的 slot 原样透传给被包装组件
    const passthrough = Object.entries(uiOverride).filter(([slot]) => !(slot in cls))
    const merged = Object.entries(cls).flatMap(([slot, slotFn]) => {
      const value = slotFn({ class: uiOverride[slot] || undefined })
      return value ? [[slot, value] as const] : []
    })

    return Object.fromEntries([...passthrough, ...merged])
  }) as ComputedRef<Record<AllKeys<P, M>, string>>

  // 仅父组件原生 slot，适合传给 UPopover、UTable 等被包装组件的 :ui
  const baseUi = computed(() =>
    Object.fromEntries(Object.entries(extendUi.value).filter(([slot]) => parentSlotKeys.has(slot)))
  ) as ComputedRef<Record<BaseKeys<P>, string>>

  // 仅 movk 扩展 slot，适合当前封装组件内部元素使用
  const extraUi = computed(() =>
    Object.fromEntries(Object.entries(extendUi.value).filter(([slot]) => !parentSlotKeys.has(slot)))
  ) as ComputedRef<Record<ExtraKeys<P, M>, string>>

  return { extendUi, baseUi, extraUi }
}
