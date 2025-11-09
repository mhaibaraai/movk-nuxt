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

export interface DateFormatterOptions {
  /**
   * 语言区域
   * @default 'zh-CN'
   */
  locale?: string
  /**
   * 日期格式化选项
   * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
   */
  formatOptions?: Intl.DateTimeFormatOptions
  /**
   * 时区标识符，默认使用本地时区
   * @see https://react-spectrum.adobe.com/internationalized/date/index.html#timezones
   */
  timeZone?: string
}

const DEFAULT_LOCALE = 'zh-CN' as const
const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

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
 * 日期格式化工具
 *
 * @example
 * ```ts
 * const formatter = useDateFormatter({ locale: 'zh-CN' })
 *
 * formatter.format(date) // "2025年11月6日"
 * formatter.toISO(date) // "2025-11-06"
 * formatter.toTimestamp(date) // 1730822400000
 * formatter.toUnixTimestamp(date) // 1730822400
 * formatter.getToday() // 今天的日期
 * formatter.isWeekend(date) // 是否周末
 * ```
 */
export function useDateFormatter(options: DateFormatterOptions = {}) {
  const locale = options.locale ?? DEFAULT_LOCALE
  const formatOptions = options.formatOptions ?? DEFAULT_FORMAT_OPTIONS
  const timeZone = options.timeZone ?? getLocalTimeZone()

  const formatter = new DateFormatter(locale, formatOptions)

  // ==================== 格式化方法 ====================

  /**
   * 格式化日期为本地化字符串
   */
  const format = (date: DateValue | undefined | null): string => {
    if (!date) return ''
    try {
      return formatter.format(date.toDate(timeZone))
    } catch (error) {
      console.error('[useDateFormatter] Format error:', error)
      return ''
    }
  }

  /**
   * 格式化日期范围
   */
  const formatRange = (
    start: DateValue | undefined | null,
    end: DateValue | undefined | null,
    separator: string = ' - '
  ): string => {
    if (!start || !end) return ''
    return `${format(start)}${separator}${format(end)}`
  }

  /**
   * 格式化日期数组
   */
  const formatArray = (
    dates: DateValue[] | undefined | null,
    separator: string = ', '
  ): string => {
    if (!dates?.length) return ''
    return dates.map(format).join(separator)
  }

  // ==================== 转换方法 ====================

  /**
   * 转换为 ISO 8601 字符串
   */
  const toISO = (date: DateValue | undefined | null): string => {
    if (!date) return ''
    try {
      return date.toString()
    } catch (error) {
      console.error('[useDateFormatter] toISO error:', error)
      return ''
    }
  }

  /**
   * 转换为 JS Date 对象
   */
  const toDate = (date: DateValue | undefined | null): Date | null => {
    if (!date) return null
    try {
      return date.toDate(timeZone)
    } catch (error) {
      console.error('[useDateFormatter] toDate error:', error)
      return null
    }
  }

  /**
   * 转换为时间戳（毫秒）
   */
  const toTimestamp = (date: DateValue | undefined | null): number | null => {
    const jsDate = toDate(date)
    return jsDate ? jsDate.getTime() : null
  }

  /**
   * 转换为时间戳（秒）
   */
  const toUnixTimestamp = (date: DateValue | undefined | null): number | null => {
    const timestamp = toTimestamp(date)
    return timestamp ? Math.floor(timestamp / 1000) : null
  }

  // ==================== 工具方法 ====================

  /**
   * 获取今天的日期
   */
  const getToday = () => today(timeZone)

  /**
   * 获取当前日期时间
   */
  const getNow = () => now(timeZone)

  /**
   * 解析 ISO 8601 日期字符串
   */
  const parse = (value: string) => {
    try {
      if (value.includes('T')) {
        return value.includes('[') ? parseZonedDateTime(value) : parseDateTime(value)
      }
      return parseDate(value)
    } catch (error) {
      console.error('[useDateFormatter] Parse error:', error)
      return null
    }
  }

  /**
   * 获取一周的开始日期
   */
  const getStartOfWeek = (date: DateValue) => startOfWeek(date, locale)

  /**
   * 获取一周的结束日期
   */
  const getEndOfWeek = (date: DateValue) => endOfWeek(date, locale)

  /**
   * 获取一月的开始日期
   */
  const getStartOfMonth = (date: DateValue) => startOfMonth(date)

  /**
   * 获取一月的结束日期
   */
  const getEndOfMonth = (date: DateValue) => endOfMonth(date)

  /**
   * 获取一年的开始日期
   */
  const getStartOfYear = (date: DateValue) => startOfYear(date)

  /**
   * 获取一年的结束日期
   */
  const getEndOfYear = (date: DateValue) => endOfYear(date)

  /**
   * 获取星期几 (0-6，0 为本地化的一周第一天)
   */
  const getDayOfWeekNumber = (date: DateValue) => getDayOfWeek(date, locale)

  /**
   * 获取本月的周数
   */
  const getWeeksInMonthNumber = (date: DateValue) => getWeeksInMonth(date, locale)

  /**
   * 判断是否为工作日
   */
  const checkIsWeekday = (date: DateValue) => isWeekday(date, locale)

  /**
   * 判断是否为周末
   */
  const checkIsWeekend = (date: DateValue) => isWeekend(date, locale)

  /**
   * 判断是否为同一天
   */
  const checkIsSameDay = (a: DateValue, b: DateValue) => isSameDay(a, b)

  /**
   * 判断是否为同一月
   */
  const checkIsSameMonth = (a: DateValue, b: DateValue) => isSameMonth(a, b)

  /**
   * 判断是否为同一年
   */
  const checkIsSameYear = (a: DateValue, b: DateValue) => isSameYear(a, b)

  /**
   * 判断是否为今天
   */
  const checkIsToday = (date: DateValue) => isToday(date, timeZone)

  // ==================== 批量转换方法 ====================

  /**
   * 通用数据转换函数
   * 自动处理单个日期、日期范围、日期数组以及嵌套对象
   */
  const convertData = <T>(
    data: T,
    converter: (value: DateValue) => any
  ): T => {
    if (!data) return data

    // 处理单个日期
    if (isDateValue(data)) {
      return converter(data) as T
    }

    // 处理日期范围
    if (isDateRange(data)) {
      return {
        start: data.start ? converter(data.start) : data.start,
        end: data.end ? converter(data.end) : data.end
      } as T
    }

    // 处理数组
    if (Array.isArray(data)) {
      return data.map(item => convertData(item, converter)) as T
    }

    // 处理对象
    if (typeof data === 'object') {
      const result = {} as T
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = convertData(data[key], converter)
        }
      }
      return result
    }

    return data
  }

  /**
   * 批量转换为 ISO 字符串
   */
  const convertToISO = <T>(data: T): T => convertData(data, toISO as any)

  /**
   * 批量转换为格式化字符串
   */
  const convertToFormatted = <T>(data: T): T => convertData(data, format as any)

  /**
   * 批量转换为 Date 对象
   */
  const convertToDate = <T>(data: T): T => convertData(data, toDate as any)

  return {
    // 格式化
    format,
    formatRange,
    formatArray,

    // 转换
    toISO,
    toDate,
    toTimestamp,
    toUnixTimestamp,
    parse,
    convertData,

    // 工具方法 - 获取日期
    getToday,
    getNow,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    getStartOfYear,
    getEndOfYear,

    // 工具方法 - 查询
    getDayOfWeek: getDayOfWeekNumber,
    getWeeksInMonth: getWeeksInMonthNumber,
    isWeekday: checkIsWeekday,
    isWeekend: checkIsWeekend,
    isSameDay: checkIsSameDay,
    isSameMonth: checkIsSameMonth,
    isSameYear: checkIsSameYear,
    isToday: checkIsToday,

    // 批量转换
    convertToISO,
    convertToFormatted,
    convertToDate,

    // 导出配置供外部使用
    locale,
    timeZone
  }
}
