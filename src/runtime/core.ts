/**
 * @movk/core
 * 后续迁移到@movk/core中的方法
 */

import type { StringOrVNode } from '@movk/core'
import type { Component, ComputedRef, DefineComponent, Ref } from 'vue'
import { isObject } from '@movk/core'

/**
 * 合并两个对象类型，U 中的属性会覆盖 T 中的属性
 *
 * @example
 * ```ts
 * type T = { a: number, c: string }
 * type U = { a: string, b: boolean }
 * type M = Merge<T, U> // { a: string, b: boolean, c: string }
 * ```
 */
export type Merge<T, U> = Omit<T, keyof U> & U

/**
 * 提供字符串字面量提示的同时允许任意字符串
 * 在 IDE 中提供 T 类型的自动补全提示，但不限制只能使用这些值
 *
 * @example
 * ```ts
 * type Color = Suggest<'red' | 'blue' | 'green'>
 *
 * // IDE 会提示 'red', 'blue', 'green'，但也可以使用其他字符串
 * const color1: Color = 'red'    // 有提示
 * const color2: Color = 'yellow' // 也可以，虽然没有提示
 * ```
 */
export type Suggest<T extends string> = T | (string & {})

/**
 * 响应式值类型 - 支持静态值、函数、Ref、Computed
 *
 * @example
 * ```ts
 * // 静态值
 * const staticValue: ReactiveValue<string, any> = 'hello'
 *
 * // 函数（基于上下文动态计算）
 * const dynamicValue: ReactiveValue<boolean, { value: string }> = (ctx) => ctx.value.length > 5
 *
 * // Ref 响应式引用
 * const refValue: ReactiveValue<number, any> = ref(42)
 *
 * // Computed 计算属性
 * const computedValue: ReactiveValue<string, any> = computed(() => `Count: ${count.value}`)
 *
 * // 在表单字段中的使用示例
 * const fieldConfig = {
 *   hidden: (ctx) => ctx.value === '', // 当值为空时隐藏
 *   if: ref(true),                     // 使用 ref 控制显示
 *   props: computed(() => ({
 *     disabled: loading.value
 *   }))                                // 使用 computed 动态属性
 * }
 * ```
 */
export type ReactiveValue<T, CTX> = T | ((ctx: CTX) => T) | Ref<T> | ComputedRef<T>

export type StripNullable<T> = T extends null | undefined ? never : T

/**
 * 判断类型 T 是否为纯对象类型
 * 纯对象是指普通的对象字面量，排除数组、函数、Date 等特殊对象类型
 * @example
 * ```ts
 * type Test1 = IsPlainObject<{ a: number }> // true
 * type Test2 = IsPlainObject<string[]>      // false
 * type Test3 = IsPlainObject<() => void>    // false
 * type Test4 = IsPlainObject<Date>          // false
 * type Test5 = IsPlainObject<string>        // false
 * type Test6 = IsPlainObject<null>          // false
 * ```
 */
export type IsPlainObject<T> = StripNullable<T> extends Record<string, any>
  ? StripNullable<T> extends any[]
    ? false
    : StripNullable<T> extends (...args: any[]) => any
      ? false
      : StripNullable<T> extends Date
        ? false
        : true
  : false

type Depth = [never, 0, 1, 2, 3, 4]

export type NestedKeys<T, D extends number = 2> = [D] extends [never]
  ? never
  : {
      [K in keyof T & string]: IsPlainObject<T[K]> extends true
        ? K | `${K}.${NestedKeys<StripNullable<T[K]>, Depth[D]>}`
        : K
    }[keyof T & string]

/**
 * vue-component-type-helpers
 * Copy from https://github.com/vuejs/language-tools/tree/master/packages/component-type-helpers
 */

export type IsComponent = StringOrVNode | Component | DefineComponent | ((...args: any[]) => any)

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

/**
 * 将字符串分解为单词数组。支持camelCase、snake_case、kebab-case等各种命名风格。
 *
 * @category String
 * @param str 要分解的字符串
 * @returns 单词数组
 * @example
 * ```ts
 * words('helloWorld') // ['hello', 'World']
 * words('hello_world') // ['hello', 'world']
 * words('hello-world') // ['hello', 'world']
 * words('XMLHttpRequest') // ['XML', 'Http', 'Request']
 * ```
 */
export function words(str: string): string[] {
  if (!str)
    return []
  // 匹配单词：字母数字组合，支持连续大写字母
  const matches = str.match(/[A-Z]*[a-z]+|[A-Z]+(?=[A-Z][a-z]|[^a-zA-Z]|$)|\d+/g)
  return matches || []
}

/**
 * 将字符串转换为Start Case格式（每个单词首字母大写，用空格分隔）。
 * 基于 generateLabelFromFieldName 的逻辑，支持各种命名风格。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns Start Case格式的字符串
 * @example
 * ```ts
 * startCase('firstName') // 'First Name'
 * startCase('first_name') // 'First Name'
 * startCase('first-name') // 'First Name'
 * startCase('XMLHttpRequest') // 'XML Http Request'
 * ```
 */
export function startCase(str: string): string {
  if (!str)
    return ''

  // 处理camelCase: firstName -> First Name
  let label = str.replace(/([A-Z])/g, ' $1')
  // 处理snake_case: first_name -> first name
  label = label.replace(/_/g, ' ')
  // 处理kebab-case: first-name -> first name
  label = label.replace(/-/g, ' ')
  // 首字母大写，其余单词首字母大写
  return label.replace(/\b\w/g, l => l.toUpperCase()).trim()
}

/**
 * 将字符串转换为驼峰命名格式（第一个单词小写，后续单词首字母大写）。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 驼峰命名格式的字符串
 * @example
 * ```ts
 * camelCase('First Name') // 'firstName'
 * camelCase('first_name') // 'firstName'
 * camelCase('first-name') // 'firstName'
 * camelCase('XMLHttpRequest') // 'xmlHttpRequest'
 * ```
 */
export function camelCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  if (wordList.length === 0)
    return ''

  return wordList
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0)
        return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * 将字符串转换为短横线命名格式（kebab-case）。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 短横线命名格式的字符串
 * @example
 * ```ts
 * kebabCase('firstName') // 'first-name'
 * kebabCase('First Name') // 'first-name'
 * kebabCase('first_name') // 'first-name'
 * kebabCase('XMLHttpRequest') // 'xml-http-request'
 * ```
 */
export function kebabCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  return wordList.map(word => word.toLowerCase()).join('-')
}

/**
 * 将字符串转换为下划线命名格式（snake_case）。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 下划线命名格式的字符串
 * @example
 * ```ts
 * snakeCase('firstName') // 'first_name'
 * snakeCase('First Name') // 'first_name'
 * snakeCase('first-name') // 'first_name'
 * snakeCase('XMLHttpRequest') // 'xml_http_request'
 * ```
 */
export function snakeCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  return wordList.map(word => word.toLowerCase()).join('_')
}

/**
 * 将字符串转换为帕斯卡命名格式（PascalCase，每个单词首字母大写）。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 帕斯卡命名格式的字符串
 * @example
 * ```ts
 * pascalCase('firstName') // 'FirstName'
 * pascalCase('first_name') // 'FirstName'
 * pascalCase('first-name') // 'FirstName'
 * pascalCase('XMLHttpRequest') // 'XmlHttpRequest'
 * ```
 */
export function pascalCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  return wordList
    .map((word) => {
      const lower = word.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * 将字符串首字母大写，其余字母小写。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 首字母大写的字符串
 * @example
 * ```ts
 * capitalize('hello') // 'Hello'
 * capitalize('HELLO') // 'Hello'
 * capitalize('hello world') // 'Hello world'
 * ```
 */
export function capitalize(str: string): string {
  if (!str)
    return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 将字符串首字母大写，其余字母保持原样。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 首字母大写的字符串
 * @example
 * ```ts
 * upperFirst('hello') // 'Hello'
 * upperFirst('hELLO') // 'HELLO'
 * upperFirst('hello world') // 'Hello world'
 * ```
 */
export function upperFirst(str: string): string {
  if (!str)
    return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 将字符串首字母小写，其余字母保持原样。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 首字母小写的字符串
 * @example
 * ```ts
 * lowerFirst('Hello') // 'hello'
 * lowerFirst('HELLO') // 'hELLO'
 * lowerFirst('Hello World') // 'hello World'
 * ```
 */
export function lowerFirst(str: string): string {
  if (!str)
    return ''
  return str.charAt(0).toLowerCase() + str.slice(1)
}

/**
 * 将字符串转换为大写格式，单词之间用空格分隔。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 大写格式的字符串
 * @example
 * ```ts
 * upperCase('firstName') // 'FIRST NAME'
 * upperCase('first_name') // 'FIRST NAME'
 * upperCase('first-name') // 'FIRST NAME'
 * upperCase('XMLHttpRequest') // 'XML HTTP REQUEST'
 * ```
 */
export function upperCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  return wordList.map(word => word.toUpperCase()).join(' ')
}

/**
 * 将字符串转换为小写格式，单词之间用空格分隔。
 *
 * @category String
 * @param str 要转换的字符串
 * @returns 小写格式的字符串
 * @example
 * ```ts
 * lowerCase('firstName') // 'first name'
 * lowerCase('First_Name') // 'first name'
 * lowerCase('FIRST-NAME') // 'first name'
 * lowerCase('XMLHttpRequest') // 'xml http request'
 * ```
 */
export function lowerCase(str: string): string {
  if (!str)
    return ''

  const wordList = words(str)
  return wordList.map(word => word.toLowerCase()).join(' ')
}

/**
 * 判断值是否为纯对象（不包括数组、函数、日期等）
 *
 * @category Object
 * @param value 要检查的值
 * @returns 是否为纯对象
 * @example
 * ```ts
 * isPlainObject({}) // true
 * isPlainObject([]) // false
 * isPlainObject(new Date()) // false
 * isPlainObject(() => {}) // false
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 深拷贝任意 JavaScript 值。
 *
 * - 优先使用原生 `structuredClone`（若可用），覆盖 `Map`/`Set`/`TypedArray`/`ArrayBuffer` 等内建类型。
 * - 对不支持 `structuredClone` 的环境，使用回退实现：
 *   - 支持循环引用（`WeakMap` 记忆化）。
 *   - 保留原型与属性描述符（含 getter/setter），复制 symbol 键。
 *   - 内建类型专项处理：`Date`/`RegExp`/`Map`/`Set`/`ArrayBuffer`/`TypedArray`/`URL`/`Error`。
 *
 * @category Object
 * @typeParam T 拷贝值的类型
 * @param obj 要被深拷贝的值
 * @param cache 内部使用的 `WeakMap`（循环引用记忆化），一般不需要传入
 * @returns 新的深拷贝值，与输入值结构等价、引用独立
 *
 * @example
 * ```ts
 * const source = { a: 1, d: new Date(), m: new Map([[1, { x: 2 }]]) }
 * const cloned = deepClone(source)
 * cloned !== source // true
 * cloned.d !== source.d // true
 * cloned.m !== source.m // true
 * cloned.m.get(1) !== source.m.get(1) // true
 * ```
 *
 * @remarks
 * 若对象包含不可克隆资源（如带有原生句柄的自定义对象），请在外层进行自定义序列化逻辑或为该类型添加专用分支。
 */
export function deepClone<T>(obj: T, cache = new WeakMap<object, any>()): T {
  if (obj === null || typeof obj !== 'object')
    return obj

  // 优先使用原生 structuredClone（覆盖 Map/Set/TypedArray 等）
  try {
    const sc = (globalThis as any).structuredClone
    if (typeof sc === 'function')
      return sc(obj)
  }
  catch {}

  const asObj = obj as unknown as object
  const hit = cache.get(asObj)
  if (hit)
    return hit as T

  // Date
  if (obj instanceof Date)
    return new Date(obj.getTime()) as T

  // RegExp
  if (obj instanceof RegExp)
    return new RegExp(obj.source, obj.flags) as T

  // Map
  if (obj instanceof Map) {
    const cloned = new Map()
    cache.set(asObj, cloned)
    for (const [k, v] of obj.entries())
      cloned.set(deepClone(k as any, cache), deepClone(v as any, cache))
    return cloned as unknown as T
  }

  // Set
  if (obj instanceof Set) {
    const cloned = new Set()
    cache.set(asObj, cloned)
    for (const v of obj.values())
      cloned.add(deepClone(v as any, cache))
    return cloned as unknown as T
  }

  // ArrayBuffer
  if (obj instanceof ArrayBuffer)
    return obj.slice(0) as T

  // TypedArray / DataView
  if (ArrayBuffer.isView(obj)) {
    const Ctor = (obj as any).constructor as new (src: any) => any
    return new Ctor(obj) as T
  }

  // URL
  if (obj instanceof URL)
    return new URL(obj.toString()) as T

  // Error
  if (obj instanceof Error) {
    const err = new (obj as any).constructor(obj.message)
    err.name = obj.name
    err.stack = obj.stack
    return err as T
  }

  // Array
  if (Array.isArray(obj)) {
    const out: any[] = []
    cache.set(asObj, out)
    for (const item of obj)
      out.push(deepClone(item as any, cache))
    return out as unknown as T
  }

  // Object：保留原型与属性描述符，复制 symbol 键
  const proto = Object.getPrototypeOf(obj)
  const cloned = Object.create(proto)
  cache.set(asObj, cloned)

  const keys = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj) as any,
  ]

  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(obj, key as any)
    if (!desc)
      continue
    if ('value' in desc)
      desc.value = deepClone((obj as any)[key as any], cache)
    Object.defineProperty(cloned, key, desc)
  }

  return cloned
}
