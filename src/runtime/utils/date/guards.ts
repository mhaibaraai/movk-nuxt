import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'

/** 执行可能抛错的转换，失败时返回 fallback */
export function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  }
  catch {
    return fallback
  }
}

/** 判断是否为 @internationalized/date 的日期对象（CalendarDate / CalendarDateTime / ZonedDateTime） */
export function isDateValue(value: unknown): value is DateValue {
  return (
    value !== null
    && typeof value === 'object'
    && 'calendar' in value
    && 'year' in value
    && 'month' in value
    && 'day' in value
  )
}

/** 判断是否为 `{ start, end }` 形态的日期范围 */
export function isDateRange(value: unknown): value is DateRange {
  return value !== null && typeof value === 'object' && 'start' in value && 'end' in value
}

/** 仅普通对象与数组参与递归转换，Date、类实例等原样保留 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
