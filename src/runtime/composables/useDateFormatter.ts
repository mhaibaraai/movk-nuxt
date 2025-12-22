import {
  DateFormatter,
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

  const formatter = new DateFormatter(locale, { ...formatOptions, timeZone })

  /** 格式化日期为本地化字符串 */
  function format(date: DateValue | undefined | null): string {
    if (!date) return ''
    try {
      return formatter.format(date.toDate(timeZone))
    }
    catch {
      return ''
    }
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
    try {
      return date.toString()
    }
    catch {
      return ''
    }
  }

  /**
   * 转换为 JS Date 对象
   *
   * 返回该日期在 UTC 午夜的 Date 对象,确保在任何环境中都能正确表示该日期。
   */
  function toDate(date: DateValue | undefined | null): Date | null {
    if (!date) return null
    try {
      return new Date(Date.UTC(date.year, date.month - 1, date.day))
    }
    catch {
      return null
    }
  }

  /** 转换为时间戳(毫秒) */
  function toTimestamp(date: DateValue | undefined | null): number | null {
    const jsDate = toDate(date)
    return jsDate ? jsDate.getTime() : null
  }

  /** 转换为 Unix 时间戳(秒) */
  function toUnixTimestamp(date: DateValue | undefined | null): number | null {
    const timestamp = toTimestamp(date)
    return timestamp ? Math.floor(timestamp / 1000) : null
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
    try {
      const weekdayFormatter = new DateFormatter(locale, { weekday: style, timeZone })
      return weekdayFormatter.format(date.toDate(timeZone))
    }
    catch {
      return ''
    }
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
      const result = {} as Record<string, unknown>
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = convertData(data[key], converter)
        }
      }
      return result as T
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
    parse,
    convertData,
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
