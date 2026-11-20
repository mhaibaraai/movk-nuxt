import { CalendarDate, parseAbsolute, parseDate, parseDateTime, parseZonedDateTime } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { isDateRange, isDateValue, isPlainObject, safe } from './guards'

export type ValueFormat = 'date-value' | 'iso' | 'timestamp' | 'unix' | 'date'

type Nullable<T> = T | undefined | null

// 匹配 ISO 末尾的 Z 或 ±HH:mm / ±HHmm 时区偏移
const ABSOLUTE_RE = /(?:Z|[+-]\d{2}:?\d{2})$/

/** 解析 ISO 8601 字符串，支持日期、日期时间、带偏移与带 IANA 时区的日期时间；非法时返回 null */
export function parseISO(value: string, timeZone: string): DateValue | null {
  return safe(() => {
    if (!value.includes('T')) return parseDate(value)
    if (value.includes('[')) return parseZonedDateTime(value)
    if (ABSOLUTE_RE.test(value)) return parseAbsolute(value, timeZone)
    return parseDateTime(value)
  }, null)
}

export function toISO(date: Nullable<DateValue>): string {
  return date ? safe(() => date.toString(), '') : ''
}

/**
 * 转换为 JS Date：纯日期取 UTC 午夜，保证任何时区下日期不偏移；
 * 带时间的值按 `timeZone` 解释，保留时分秒
 */
export function toDate(date: Nullable<DateValue>, timeZone: string): Date | null {
  if (!date) return null
  return safe(() => 'hour' in date
    ? date.toDate(timeZone)
    : new Date(Date.UTC(date.year, date.month - 1, date.day)), null)
}

export function toTimestamp(date: Nullable<DateValue>, timeZone: string): number | null {
  return toDate(date, timeZone)?.getTime() ?? null
}

export function toUnixTimestamp(date: Nullable<DateValue>, timeZone: string): number | null {
  const timestamp = toTimestamp(date, timeZone)
  return timestamp === null ? null : Math.floor(timestamp / 1000)
}

export function toFormat(date: Nullable<DateValue>, format: ValueFormat, timeZone: string): unknown {
  if (!date) return undefined
  switch (format) {
    case 'date-value': return date
    case 'iso': return toISO(date)
    case 'timestamp': return toTimestamp(date, timeZone)
    case 'unix': return toUnixTimestamp(date, timeZone)
    case 'date': return toDate(date, timeZone)
  }
}

/** 从 JS Date 反解为 CalendarDate（用 UTC 字段，与纯日期的 toDate 互逆） */
export function fromDate(value: Nullable<Date>): CalendarDate | null {
  if (!value || Number.isNaN(value.getTime())) return null
  return safe(() => new CalendarDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()), null)
}

export function fromTimestamp(value: Nullable<number>): CalendarDate | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return fromDate(new Date(value))
}

export function fromUnixTimestamp(value: Nullable<number>): CalendarDate | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return fromTimestamp(value * 1000)
}

/** 按 format 把任意值反解为 DateValue；类型不匹配返回 null */
export function fromFormat(value: unknown, format: ValueFormat, timeZone: string): DateValue | null {
  if (value === null || value === undefined) return null
  switch (format) {
    case 'date-value': return isDateValue(value) ? value : null
    case 'iso': return typeof value === 'string' && value ? parseISO(value, timeZone) : null
    case 'timestamp': return typeof value === 'number' ? fromTimestamp(value) : null
    case 'unix': return typeof value === 'number' ? fromUnixTimestamp(value) : null
    case 'date': return value instanceof Date ? fromDate(value) : null
  }
}

/**
 * 递归转换数据中的日期：单个日期、日期范围、数组与普通对象；
 * Date 与其他类实例原样保留
 */
export function convertData<T>(data: T, converter: (value: DateValue) => unknown): T {
  if (!data) return data
  if (isDateValue(data)) return converter(data) as T

  if (isDateRange(data)) {
    const range = data as { start?: DateValue, end?: DateValue }
    return {
      start: range.start ? converter(range.start) : range.start,
      end: range.end ? converter(range.end) : range.end
    } as T
  }

  if (Array.isArray(data)) return data.map(item => convertData(item, converter)) as T

  if (isPlainObject(data)) {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, convertData(value, converter)])) as T
  }

  return data
}

/** 按 format 递归反解 single / range / array；date-value 时透传 */
export function convertFromFormat<T>(data: T, format: ValueFormat, timeZone: string): unknown {
  if (data === null || data === undefined || format === 'date-value') return data
  if (Array.isArray(data)) return data.map(item => convertFromFormat(item, format, timeZone))

  if (isDateRange(data)) {
    const { start, end } = data as { start?: unknown, end?: unknown }
    const decode = (value: unknown) => value === undefined || value === null ? value : fromFormat(value, format, timeZone)
    return { start: decode(start), end: decode(end) }
  }

  return fromFormat(data, format, timeZone)
}
