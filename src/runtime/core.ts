/**
 * vue-component-type-helpers
 * Copy from https://github.com/vuejs/language-tools/tree/master/packages/component-type-helpers
 */

import type { StringOrVNode } from '@movk/core'
import type { Component, DefineComponent, FunctionalComponent, VNode } from 'vue'
import { isObject } from '@movk/core'

export type IsComponent = StringOrVNode | Component | DefineComponent | FunctionalComponent | ((...args: any[]) => VNode)

export type ComponentType<T> = T extends new (...args: any) => object ? 1
  : T extends (...args: any) => any ? 2
    : 0

export type ComponentProps<T> = T extends new (...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
    : object

export type ComponentSlots<T> = T extends new (...args: any) => { $slots: infer S } ? NonNullable<S>
  : T extends new (...args: any) => { $scopedSlots: infer S } ? NonNullable<S> // Vue 2
    : T extends (props: any, ctx: { slots: infer S, attrs: any, emit: any }, ...args: any) => any ? NonNullable<S>
      : object

export type ComponentAttrs<T> = T extends new (...args: any) => { $attrs: infer A } ? NonNullable<A>
  : T extends (props: any, ctx: { slots: any, attrs: infer A, emit: any }, ...args: any) => any ? NonNullable<A>
    : object

export type ComponentEmit<T> = T extends new (...args: any) => { $emit: infer E } ? NonNullable<E>
  : T extends (props: any, ctx: { slots: any, attrs: any, emit: infer E }, ...args: any) => any ? NonNullable<E>
    : object

export type ComponentExposed<T> = T extends new (...args: any) => infer E ? E
  : T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any ? NonNullable<E>
    : object

type PathSegment = string | number
type PathSegments = PathSegment[]
type PathInput = string | PathSegments

/**
 * 将路径字符串解析为片段数组。
 *
 * - 支持点语法与方括号语法混用
 * - 引号键支持单/双引号与反斜杠转义
 * - 方括号内未引号的非负整数字面量解析为 number 段
 * - 点语法中的纯数字段保持字符串（不转为索引）
 *
 * @category Object
 * @param path 路径字符串或片段数组
 * @returns 解析后的片段数组
 * @example
 * ```ts
 * toPath('a.b[0].c') // ['a', 'b', 0, 'c']
 * toPath("a['x.y']") // ['a', 'x.y']
 * ```
 */
export function toPath(path: PathInput): PathSegments {
  if (Array.isArray(path))
    return path.slice()

  const result: PathSegments = []
  if (path === '')
    return result

  // 解析状态机
  let i = 0
  const input = path
  const length = input.length

  // 收集一个点语法段（处理转义 \\ 和 \\.)
  function readDotSegment(start: number): { value: string, next: number } {
    let value = ''
    let j = start
    while (j < length) {
      const ch = input.charCodeAt(j)
      if (ch === 46 /* . */) {
        break
      }
      if (ch === 92 /* \\ */) {
        // 转义下一个字符（例如 \\. 保留 .，\\' 保留 '，\\[ 保留 [ 等）
        j++
        if (j < length)
          value += input[j]
        j++
        continue
      }
      if (ch === 91 /* [ */) {
        // 点段提前结束，交由 bracket 处理
        break
      }
      value += input[j]
      j++
    }
    return { value, next: j }
  }

  // 读取方括号段：支持数字索引、引号键、未引号键
  function readBracket(start: number): { segment: PathSegment | null, next: number } {
    // start 位于 '['
    let j = start + 1
    // 跳过空白
    while (j < length && /\s/.test(input[j]!)) j++
    if (j >= length)
      throw new Error('Invalid path: missing closing "]"')

    const ch = input[j]
    if (ch === '"' || ch === '\'') {
      // 引号键
      const quote = ch
      j++
      let value = ''
      let closed = false
      while (j < length) {
        const c = input.charCodeAt(j)
        if (c === 92 /* \\ */) {
          // 转义字符
          j++
          if (j < length)
            value += input[j]
          j++
          continue
        }
        if (input[j] === quote) {
          closed = true
          j++
          break
        }
        value += input[j]
        j++
      }
      if (!closed)
        throw new Error('Invalid path: missing closing quote in bracket')
      // 跳过空白与右括号
      while (j < length && /\s/.test(input[j]!)) j++
      if (j >= length || input[j] !== ']')
        throw new Error('Invalid path: missing closing "]"')
      j++
      return { segment: value, next: j }
    }

    // 未引号：可能是数字索引或裸键
    let value = ''
    while (j < length && input[j] !== ']') {
      value += input[j]
      j++
    }
    if (j >= length)
      throw new Error('Invalid path: missing closing "]"')
    // 去掉两端空白
    const trimmed = value.trim()
    // 纯十进制非负整数字面量 => number 段
    if (/^(?:0|[1-9]\d*)$/.test(trimmed)) {
      j++
      return { segment: Number(trimmed), next: j }
    }
    // 否则作为字符串键
    j++
    return { segment: trimmed, next: j }
  }

  // 主循环
  while (i < length) {
    const code = input.charCodeAt(i)
    if (code === 46 /* . */) {
      // 跳过连续的点，产生空段意味着空键名
      i++
      continue
    }
    if (code === 91 /* [ */) {
      const { segment, next } = readBracket(i)
      if (segment !== null)
        result.push(segment)
      i = next
      continue
    }
    const { value, next } = readDotSegment(i)
    if (value.length > 0 || (next < length && input[next] === '.'))
      result.push(value)
    i = next
  }

  return result
}

/**
 * 读取对象指定路径的值。
 *
 * - 若取值结果为 undefined，则返回 defaultValue
 * - 若取值结果为 null，则直接返回 null（不触发默认值）
 * - 传入空路径时返回 object 本身
 *
 * @category Object
 * @param object 源对象
 * @param path 路径字符串或片段数组
 * @param defaultValue 结果为 undefined 时返回的默认值
 * @returns 读取到的值或默认值
 * @example
 * ```ts
 * const obj = { a: { b: { c: 1, d: undefined }, e: null }, arr: [{ x: 9 }] }
 * getPath(obj, 'a.b.c') // 1
 * getPath(obj, 'a.b.d', 42) // 42（d 为 undefined，使用默认值）
 * getPath(obj, 'a.e', 100) // null（null 不触发默认值）
 * getPath(obj, 'arr[0].x') // 9
 * getPath(obj, '') // 返回 obj 本身
 * ```
 */
export function getPath<T, D = undefined>(object: T, path: PathInput, defaultValue?: D): unknown | D {
  const segments = toPath(path)
  if (segments.length === 0)
    return (object as unknown) as D
  let cur: any = object as any
  for (let idx = 0; idx < segments.length; idx++) {
    if (cur == null)
      return defaultValue as D
    const key = segments[idx] as any
    cur = cur[key]
  }
  return cur === undefined ? (defaultValue as D) : cur
}

/**
 * 在对象指定路径写入值。缺失路径会被自动创建：
 * - 下一段为 number（索引）时创建数组
 * - 下一段为 string（属性）时创建对象
 *
 * 若中途遇到非容器类型（如字符串/数值/布尔），会被替换为正确的容器以继续写入。
 *
 * @category Object
 * @param object 目标对象（原地修改并返回同一引用）
 * @param path 路径字符串或片段数组
 * @param value 要写入的值
 * @returns 原对象（已修改）
 * @example
 * ```ts
 * const obj: any = {}
 * setPath(obj, 'a.b[0].c', 7)
 * // obj => { a: { b: [{ c: 7 }] } }
 *
 * setPath(obj, 'a.b[2].d', 8)
 * // 数组自动扩容到长度 3
 * // obj.a.b[2] => { d: 8 }
 *
 * setPath(obj, 'a.0.b', 1) // 点语法数字键保持为字符串键
 * // obj => { a: { 0: { b: 1 } } }
 * setPath(obj, 'a[0].b', 2) // 索引用方括号
 * // obj.a[0].b => 2
 * ```
 */
export function setPath<T extends Record<string, any>>(object: T, path: PathInput, value: unknown): T {
  const segments = toPath(path)
  if (segments.length === 0)
    return object

  let cur: any = object as any
  for (let i = 0; i < segments.length; i++) {
    const key = segments[i]
    const isLast = i === segments.length - 1
    if (isLast) {
      cur[key as any] = value
      break
    }
    const nextKey = segments[i + 1]
    let nextVal = cur[key as any]
    // 决定需要的容器类型
    const needArray = typeof nextKey === 'number'
    if (!isObject(nextVal)) {
      nextVal = needArray ? [] : {}
      cur[key as any] = nextVal
    }
    // 如果需要数组且当前不是数组，替换为数组
    if (needArray && !Array.isArray(nextVal)) {
      nextVal = []
      cur[key as any] = nextVal
    }
    // 如果是数组并且下一个 key 为数字索引，扩容（允许稀疏）
    if (needArray && Array.isArray(nextVal)) {
      const idxNum = Number(nextKey)
      if (Number.isInteger(idxNum) && idxNum >= 0 && nextVal.length <= idxNum)
        nextVal.length = idxNum + 1
    }
    cur = nextVal
  }
  return object
}

/**
 * 将片段数组序列化为路径字符串。
 *
 * 规则：
 * - 合法标识符段使用点拼接（a.b.c）
 * - 数字段转为索引（[0]）
 * - 其它需要转义的键使用方括号引号（['x.y']），并转义 \\ 与 '\''
 *
 * @category Object
 * @param segments 路径片段数组
 * @returns 路径字符串
 * @example
 * ```ts
 * const p = joinPath(['a', 'x.y', 0, 'space key'])
 * // p: "a['x.y'][0]['space key']"
 * // 与解析往返：toPath(p) => ['a', 'x.y', 0, 'space key']
 * ```
 */
export function joinPath(segments: (string | number)[]): string {
  let out = ''
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (typeof seg === 'number' && Number.isInteger(seg) && seg >= 0) {
      out += `[${seg}]`
      continue
    }
    const s = String(seg)
    // 合法标识符：以字母/$_ 开始，后续字母/数字/$_，且不包含点
    const isIdentifier = /^[A-Z_$][\w$]*$/i.test(s)
    if (out.length === 0 && isIdentifier) {
      out += s
      continue
    }
    if (isIdentifier) {
      out += `.${s}`
      continue
    }
    // 需要括号引号并转义
    const escaped = s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
    out += `[ '${escaped}' ]`.replace(/\s+/g, ' ')
  }
  return out
}
