import {
  CalendarDate,
  DateFormatter as IntlDateFormatter,
  getLocalTimeZone,
  today,
  now,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getDayOfWeek,
  getWeeksInMonth,
  isWeekday,
  isWeekend,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  parseDate,
  parseDateTime,
  parseZonedDateTime
} from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'

export type ValueFormat = 'date-value' | 'iso' | 'timestamp' | 'unix' | 'date'

/**
 * 日期格式化器配置选项
 */
export interface DateFormatterOptions {
  /**
   * 语言区域
   * @defaultValue 'zh-CN'
   */
  locale?: string
  /**
   * 日期格式化选项
   * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat | Intl.DateTimeFormat}
   */
  formatOptions?: Intl.DateTimeFormatOptions
  /**
   * 时区标识符,默认使用本地时区
   * @see {@link https://react-spectrum.adobe.com/internationalized/date/index.html#timezones | 时区文档}
   */
  timeZone?: string
}

const DEFAULT_LOCALE = 'zh-CN'
const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() }
  catch { return fallback }
}

/**
 * 检查值是否为 DateValue 类型
 */
function isDateValue(value: unknown): value is DateValue {
  return (
    value !== null
    && value !== undefined
    && typeof value === 'object'
    && 'calendar' in value
    && 'year' in value
    && 'month' in value
    && 'day' in value
  )
}

/**
 * 检查值是否为 DateRange 类型
 */
function isDateRange(value: unknown): value is DateRange {
  return (
    value !== null
    && value !== undefined
    && typeof value === 'object'
    && 'start' in value
    && 'end' in value
  )
}

/**
 * 日期格式化工具 Composable
 *
 * 提供日期格式化、转换、解析和查询功能,基于 `@internationalized/date` 库实现国际化支持。
 *
 * @param options - 配置选项
 * @returns 日期格式化工具集
 *
 * @example
 * ```ts
 * const formatter = useDateFormatter({ locale: 'zh-CN' })
 *
 * formatter.format(date) // "2025年11月6日"
 * formatter.toISO(date) // "2025-11-06"
 * formatter.toTimestamp(date) // 1730822400000
 * formatter.getToday() // 今天的日期
 * formatter.isWeekend(date) // 是否周末
 * ```
 */
export function useDateFormatter(options: DateFormatterOptions = {}) {
  const locale = options.locale ?? DEFAULT_LOCALE
  const formatOptions = options.formatOptions ?? DEFAULT_FORMAT_OPTIONS
  const timeZone = options.timeZone ?? getLocalTimeZone()

  const formatter = new IntlDateFormatter(locale, { ...formatOptions, timeZone })

  /** 格式化日期为本地化字符串 */
  function format(date: DateValue | undefined | null): string {
    if (!date) return ''
    return safe(() => formatter.format(date.toDate(timeZone)), '')
  }

  /**
   * 格式化日期范围
   * @param start - 开始日期
   * @param end - 结束日期
   * @param separator - 分隔符
   * @defaultValue ' - '
   */
  function formatRange(
    start: DateValue | undefined | null,
    end: DateValue | undefined | null,
    separator = ' - '
  ): string {
    if (!start || !end) return ''
    return `${format(start)}${separator}${format(end)}`
  }

  /**
   * 格式化日期数组
   * @param dates - 日期数组
   * @param separator - 分隔符
   * @defaultValue ', '
   */
  function formatArray(
    dates: DateValue[] | undefined | null,
    separator = ', '
  ): string {
    if (!dates?.length) return ''
    return dates.map(format).join(separator)
  }

  /** 转换为 ISO 8601 字符串 */
  function toISO(date: DateValue | undefined | null): string {
    if (!date) return ''
    return safe(() => date.toString(), '')
  }

  /**
   * 转换为 JS Date 对象
   *
   * 返回该日期在 UTC 午夜的 Date 对象,确保在任何环境中都能正确表示该日期。
   */
  function toDate(date: DateValue | undefined | null): Date | null {
    if (!date) return null
    return safe(() => new Date(Date.UTC(date.year, date.month - 1, date.day)), null)
  }

  /** 转换为时间戳(毫秒) */
  function toTimestamp(date: DateValue | undefined | null): number | null {
    const jsDate = toDate(date)
    return jsDate ? jsDate.getTime() : null
  }

  /** 转换为 Unix 时间戳(秒) */
  function toUnixTimestamp(date: DateValue | undefined | null): number | null {
    const timestamp = toTimestamp(date)
    return timestamp === null ? null : Math.floor(timestamp / 1000)
  }

  /** 按 ValueFormat 把 DateValue 转换为指定形态 */
  function toFormat(date: DateValue | undefined | null, format: ValueFormat): unknown {
    if (!date) return undefined
    switch (format) {
      case 'date-value': return date
      case 'iso': return toISO(date)
      case 'timestamp': return toTimestamp(date)
      case 'unix': return toUnixTimestamp(date)
      case 'date': return toDate(date)
    }
  }

  /** 按 format 递归转换 single / range / array；date-value 时透传 */
  function convertToFormat<T>(data: T, format: ValueFormat): unknown {
    if (format === 'date-value') return data
    return convertData(data, value => toFormat(value, format))
  }

  /** 从 JS Date 反解为 CalendarDate（用 UTC 字段，与 toDate 互逆） */
  function fromDate(value: Date | undefined | null): CalendarDate | null {
    if (!value || Number.isNaN(value.getTime())) return null
    return safe(
      () => new CalendarDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()),
      null
    )
  }

  /** 毫秒时间戳 → CalendarDate */
  function fromTimestamp(value: number | undefined | null): CalendarDate | null {
    if (value === null || value === undefined || Number.isNaN(value)) return null
    return fromDate(new Date(value))
  }

  /** Unix 秒时间戳 → CalendarDate */
  function fromUnixTimestamp(value: number | undefined | null): CalendarDate | null {
    if (value === null || value === undefined || Number.isNaN(value)) return null
    return fromTimestamp(value * 1000)
  }

  /** ISO 字符串 → DateValue */
  function fromISO(value: string | undefined | null): DateValue | null {
    if (!value) return null
    return parse(value)
  }

  /** 按 format 把任意值反解为 DateValue；类型不匹配返回 null */
  function fromFormat(value: unknown, format: ValueFormat): DateValue | null {
    if (value === null || value === undefined) return null
    if (format === 'date-value') return isDateValue(value) ? value : null
    if (format === 'iso') return typeof value === 'string' ? fromISO(value) : null
    if (format === 'timestamp') return typeof value === 'number' ? fromTimestamp(value) : null
    if (format === 'unix') return typeof value === 'number' ? fromUnixTimestamp(value) : null
    if (format === 'date') return value instanceof Date ? fromDate(value) : null
    return null
  }

  /** 按 format 递归反解 single / range / array；date-value 时透传 */
  function convertFromFormat<T>(data: T, format: ValueFormat): unknown {
    if (data === null || data === undefined) return data
    if (format === 'date-value') return data

    if (Array.isArray(data)) return data.map(item => convertFromFormat(item, format))

    if (typeof data === 'object' && 'start' in data && 'end' in data) {
      const range = data as { start?: unknown, end?: unknown }
      return {
        start: range.start === undefined || range.start === null ? range.start : fromFormat(range.start, format),
        end: range.end === undefined || range.end === null ? range.end : fromFormat(range.end, format)
      }
    }

    return fromFormat(data, format)
  }

  /** 获取今天的日期 */
  function getToday() {
    return today(timeZone)
  }

  /** 获取当前日期时间 */
  function getNow() {
    return now(timeZone)
  }

  /**
   * 解析 ISO 8601 日期字符串
   * @param value - ISO 格式字符串,支持日期、日期时间、带时区的日期时间
   */
  function parse(value: string) {
    try {
      if (value.includes('T')) {
        return value.includes('[') ? parseZonedDateTime(value) : parseDateTime(value)
      }
      return parseDate(value)
    }
    catch {
      return null
    }
  }

  /** 获取一周的开始日期 */
  function getStartOfWeek(date: DateValue) {
    return startOfWeek(date, locale)
  }

  /** 获取一周的结束日期 */
  function getEndOfWeek(date: DateValue) {
    return endOfWeek(date, locale)
  }

  /** 获取一月的开始日期 */
  function getStartOfMonth(date: DateValue) {
    return startOfMonth(date)
  }

  /** 获取一月的结束日期 */
  function getEndOfMonth(date: DateValue) {
    return endOfMonth(date)
  }

  /** 获取一年的开始日期 */
  function getStartOfYear(date: DateValue) {
    return startOfYear(date)
  }

  /** 获取一年的结束日期 */
  function getEndOfYear(date: DateValue) {
    return endOfYear(date)
  }

  /** 获取星期几数字 (0-6,0 为本地化的一周第一天) */
  function getDayOfWeekNumber(date: DateValue) {
    return getDayOfWeek(date, locale)
  }

  /**
   * 获取本地化的星期几名称
   * @param date - 日期
   * @param style - 格式样式
   * - `'narrow'`: 一
   * - `'short'`: 周一
   * - `'long'`: 星期一
   * @defaultValue 'long'
   */
  function getDayOfWeekName(
    date: DateValue,
    style: 'narrow' | 'short' | 'long' = 'long'
  ): string {
    return safe(() => {
      const weekdayFormatter = new IntlDateFormatter(locale, { weekday: style, timeZone })
      return weekdayFormatter.format(date.toDate(timeZone))
    }, '')
  }

  /** 获取本月的周数 */
  function getWeeksInMonthNumber(date: DateValue) {
    return getWeeksInMonth(date, locale)
  }

  /** 判断是否为工作日 */
  function checkIsWeekday(date: DateValue) {
    return isWeekday(date, locale)
  }

  /** 判断是否为周末 */
  function checkIsWeekend(date: DateValue) {
    return isWeekend(date, locale)
  }

  /** 判断是否为同一天 */
  function checkIsSameDay(a: DateValue, b: DateValue) {
    return isSameDay(a, b)
  }

  /** 判断是否为同一月 */
  function checkIsSameMonth(a: DateValue, b: DateValue) {
    return isSameMonth(a, b)
  }

  /** 判断是否为同一年 */
  function checkIsSameYear(a: DateValue, b: DateValue) {
    return isSameYear(a, b)
  }

  /** 判断是否为今天 */
  function checkIsToday(date: DateValue) {
    return isToday(date, timeZone)
  }

  /**
   * 通用数据转换函数
   *
   * 自动处理单个日期、日期范围、日期数组以及嵌套对象。
   *
   * @param data - 待转换的数据
   * @param converter - 转换函数
   */
  function convertData<T>(data: T, converter: (value: DateValue) => unknown): T {
    if (!data) return data

    if (isDateValue(data)) {
      return converter(data) as T
    }

    if (isDateRange(data)) {
      const range = data as { start?: DateValue, end?: DateValue }
      return {
        start: range.start ? converter(range.start) : range.start,
        end: range.end ? converter(range.end) : range.end
      } as T
    }

    if (Array.isArray(data)) {
      return data.map(item => convertData(item, converter)) as T
    }

    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, convertData(v, converter)])
      ) as T
    }

    return data
  }

  /** 批量转换为 ISO 字符串 */
  function convertToISO<T>(data: T): T {
    return convertData(data, toISO)
  }

  /** 批量转换为格式化字符串 */
  function convertToFormatted<T>(data: T): T {
    return convertData(data, format)
  }

  /** 批量转换为 Date 对象 */
  function convertToDate<T>(data: T): T {
    return convertData(data, toDate)
  }

  return {
    format,
    formatRange,
    formatArray,
    toISO,
    toDate,
    toTimestamp,
    toUnixTimestamp,
    toFormat,
    fromISO,
    fromDate,
    fromTimestamp,
    fromUnixTimestamp,
    fromFormat,
    parse,
    convertData,
    convertToFormat,
    convertFromFormat,
    getToday,
    getNow,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    getStartOfYear,
    getEndOfYear,
    getDayOfWeek: getDayOfWeekNumber,
    getDayOfWeekName,
    getWeeksInMonth: getWeeksInMonthNumber,
    isWeekday: checkIsWeekday,
    isWeekend: checkIsWeekend,
    isSameDay: checkIsSameDay,
    isSameMonth: checkIsSameMonth,
    isSameYear: checkIsSameYear,
    isToday: checkIsToday,
    isDateValue,
    isDateRange,
    convertToISO,
    convertToFormatted,
    convertToDate,
    locale,
    timeZone
  }
}

export type { CalendarDate } from '@internationalized/date'

export type DateFormatter = ReturnType<typeof useDateFormatter>

export type {
  AnyCalendarDate,
  Calendar,
  CalendarDateTime,
  DateDuration,
  DateFields,
  DateValue,
  Time,
  ZonedDateTime
} from '@internationalized/date'
export type { DateRange } from 'reka-ui'
