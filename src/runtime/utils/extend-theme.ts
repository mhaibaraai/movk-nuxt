import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { tv } from './tv'
import type { ClassNameValue } from '../types'

type SlotsLike = { slots: Record<string, unknown> }
type SlotFn = (opts: { class?: unknown }) => string
type SlotMap = Record<string, SlotFn>
type MergeParams = {
  ui?: Record<string, ClassNameValue>
  variants?: Record<string, unknown>
}

type BaseKeys<P extends SlotsLike> = string & keyof P['slots']
type ExtraKeys<P extends SlotsLike, M extends SlotsLike> = string & Exclude<keyof M['slots'], keyof P['slots']>
type AllKeys<P extends SlotsLike, M extends SlotsLike> = string & (keyof P['slots'] | keyof M['slots'])

export interface ExtendedTv<P extends SlotsLike, M extends SlotsLike> {
  ui: ComputedRef<Record<AllKeys<P, M>, string>>
  baseUi: ComputedRef<Record<BaseKeys<P>, string>>
  extraUi: ComputedRef<Record<ExtraKeys<P, M>, string>>
}

export function useExtendedTv<P extends SlotsLike, M extends SlotsLike>(
  parentTheme: P,
  movkTheme: M,
  getOverride: () => unknown = () => ({}),
  getParams: () => MergeParams = () => ({})
): ExtendedTv<P, M> {
  // 父 theme 只用于划分被包装组件的原生 slot 边界。
  const parentSlotKeys = new Set(Object.keys(parentTheme.slots))
  // 补齐父 slot key，让最终 ui 同时包含父组件和扩展组件的 slot。
  const emptySlots = Object.fromEntries(
    Object.keys(parentTheme.slots).map(key => [key, ''])
  )

  // 完整合并结果：包含父组件原生 slot 与 movk 扩展 slot。
  const ui = computed(() => {
    const ov = (getOverride() ?? {}) as Record<string, unknown>
    const { ui: uiOverride, variants } = getParams()

    const tvFn = tv({
      slots: { ...emptySlots, ...(ov.slots as Record<string, unknown> | undefined) },
      ...(ov.variants ? { variants: ov.variants } : {}),
      ...(ov.compoundVariants ? { compoundVariants: ov.compoundVariants } : {}),
      ...(ov.defaultVariants ? { defaultVariants: ov.defaultVariants } : {}),
      extend: tv(movkTheme as never)
    } as never)

    const cls = (tvFn as unknown as (v?: unknown) => SlotMap)(variants)
    const slotKeys = new Set(Object.keys(cls))

    const result: Record<string, string> = Object.fromEntries(
      Object.entries((uiOverride as Record<string, string> | undefined) ?? {}).filter(
        ([key]) => !slotKeys.has(key)
      )
    )

    for (const key of slotKeys) {
      const slotFn = cls[key]
      if (!slotFn) continue
      const merged = slotFn({ class: uiOverride?.[key] || undefined })
      if (merged) result[key] = merged
    }

    return result
  }) as ComputedRef<Record<AllKeys<P, M>, string>>

  // 仅父组件原生 slot，适合传给 UPopover、UInput 等被包装组件的 :ui。
  const baseUi = computed(() =>
    Object.fromEntries(
      Object.entries(ui.value).filter(([k]) => parentSlotKeys.has(k))
    )
  ) as ComputedRef<Record<BaseKeys<P>, string>>

  // 仅 movk 扩展 slot，适合当前封装组件内部元素使用。
  const extraUi = computed(() =>
    Object.fromEntries(
      Object.entries(ui.value).filter(([k]) => !parentSlotKeys.has(k))
    )
  ) as ComputedRef<Record<ExtraKeys<P, M>, string>>

  return { ui, baseUi, extraUi }
}
