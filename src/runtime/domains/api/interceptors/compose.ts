import type { $Fetch } from 'nitropack/types'
import type { FetchHook } from 'ofetch'

/**
 * 单端点的 movk 内置拦截器集合
 * @description 由 api.factory 在创建 $fetch 实例时挂到实例上，供 useApiFetch 在用户传入同名钩子时组合复用
 */
export interface MovkInterceptors {
  onRequest: FetchHook
  onResponse: FetchHook
  onResponseError: FetchHook
}

const MOVK_INTERCEPTORS = Symbol('movk:interceptors')

interface WithInterceptors {
  [MOVK_INTERCEPTORS]?: MovkInterceptors
}

/**
 * 把 movk 内置拦截器以非枚举符号挂到 $fetch 实例
 * @description 符号键不进入 ApiInstance 公共类型，强转集中于此
 */
export function attachInterceptors(instance: $Fetch, interceptors: MovkInterceptors): void {
  Object.defineProperty(instance, MOVK_INTERCEPTORS, {
    value: interceptors,
    enumerable: false,
    configurable: true
  })
}

/** 读取实例上挂载的 movk 内置拦截器 */
export function getInterceptors(instance: $Fetch): MovkInterceptors | undefined {
  return (instance as WithInterceptors)[MOVK_INTERCEPTORS]
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * 组合 movk 内置钩子与用户钩子为数组（movk 先执行）
 * @description 用户未传钩子时返回 undefined，让 ofetch 沿用实例 default（不覆盖）；
 * 用户传入时返回 `[movkHook, ...userHooks]`，使用户钩子拿到 movk 处理后的上下文
 */
export function composeHook<H>(movkHook: H, userHook: H | H[] | undefined): H[] | undefined {
  if (userHook === undefined) return undefined
  return [movkHook, ...toArray(userHook)]
}
