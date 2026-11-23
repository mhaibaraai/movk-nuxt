import {
  DateFormatter as IntlDateFormatter,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getDayOfWeek,
  getLocalTimeZone,
  getWeeksInMonth,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isWeekday,
  isWeekend,
  now,
  startOfMonth,
  startOfWeek,
  startOfYear,
  today
} from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { getCurrentInstance } from 'vue'
import { useLocale } from '@nuxt/ui/composables/useLocale'
import { isDateRange, isDateValue, safe } from '../utils/date/guards'
import {
  convertData,
  convertFromFormat,
  fromDate,
  fromFormat,
  fromTimestamp,
  fromUnixTimestamp,
  parseISO,
  toDate,
  toFormat,
  toISO,
  toTimestamp,
  toUnixTimestamp
} from '../utils/date/convert'
import type { ValueFormat } from '../utils/date/convert'

export type { ValueFormat }

/**
 * 日期格式化器配置选项
 */
export interface DateFormatterOptions {
  /** 语言区域，缺省时跟随 `<UApp :locale>`，组件外调用时为 `'en'` */
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

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

type Nullable<T> = T | undefined | null
type WeekdayStyle = 'narrow' | 'short' | 'long'

function resolveLocale(locale?: string): string {
  if (locale) return locale
  return getCurrentInstance() ? useLocale().code.value : 'en'
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
  const locale = resolveLocale(options.locale)
  const timeZone = options.timeZone ?? getLocalTimeZone()
  const formatter = new IntlDateFormatter(locale, { ...(options.formatOptions ?? DEFAULT_FORMAT_OPTIONS), timeZone })
  const weekdayFormatters = new Map<WeekdayStyle, IntlDateFormatter>()

  /** 格式化日期为本地化字符串 */
  function format(date: Nullable<DateValue>): string {
    return date ? safe(() => formatter.format(date.toDate(timeZone)), '') : ''
  }

  /** 格式化日期范围，任一端为空时返回空串；`separator` 缺省为 `' - '` */
  function formatRange(start: Nullable<DateValue>, end: Nullable<DateValue>, separator = ' - '): string {
    return start && end ? `${format(start)}${separator}${format(end)}` : ''
  }

  /** 格式化日期数组；`separator` 缺省为 `', '` */
  function formatArray(dates: Nullable<DateValue[]>, separator = ', '): string {
    return dates?.length ? dates.map(format).join(separator) : ''
  }

  /**
   * 获取本地化的星期几名称：`narrow` 如「六」，`short` 如「周六」，`long` 如「星期六」
   * @defaultValue 'long'
   */
  function getDayOfWeekName(date: DateValue, style: WeekdayStyle = 'long'): string {
    return safe(() => {
      let weekday = weekdayFormatters.get(style)
      if (!weekday) {
        weekday = new IntlDateFormatter(locale, { weekday: style, timeZone })
        weekdayFormatters.set(style, weekday)
      }
      return weekday.format(date.toDate(timeZone))
    }, '')
  }

  return {
    format,
    formatRange,
    formatArray,
    toISO,
    toDate: (date: Nullable<DateValue>) => toDate(date, timeZone),
    toTimestamp: (date: Nullable<DateValue>) => toTimestamp(date, timeZone),
    toUnixTimestamp: (date: Nullable<DateValue>) => toUnixTimestamp(date, timeZone),
    toFormat: (date: Nullable<DateValue>, valueFormat: ValueFormat) => toFormat(date, valueFormat, timeZone),
    fromISO: (value: Nullable<string>) => value ? parseISO(value, timeZone) : null,
    fromDate,
    fromTimestamp,
    fromUnixTimestamp,
    fromFormat: (value: unknown, valueFormat: ValueFormat) => fromFormat(value, valueFormat, timeZone),
    /** 解析 ISO 8601 字符串，支持日期、日期时间、带时区的日期时间 */
    parse: (value: string) => parseISO(value, timeZone),
    convertData,
    /** 按 format 递归转换 single / range / array；date-value 时透传 */
    convertToFormat: <T>(data: T, valueFormat: ValueFormat): unknown =>
      valueFormat === 'date-value' ? data : convertData(data, value => toFormat(value, valueFormat, timeZone)),
    convertFromFormat: <T>(data: T, valueFormat: ValueFormat) => convertFromFormat(data, valueFormat, timeZone),
    getToday: () => today(timeZone),
    getNow: () => now(timeZone),
    getStartOfWeek: (date: DateValue) => startOfWeek(date, locale),
    getEndOfWeek: (date: DateValue) => endOfWeek(date, locale),
    getStartOfMonth: (date: DateValue) => startOfMonth(date),
    getEndOfMonth: (date: DateValue) => endOfMonth(date),
    getStartOfYear: (date: DateValue) => startOfYear(date),
    getEndOfYear: (date: DateValue) => endOfYear(date),
    /** 星期几数字（0-6，0 为本地化的一周第一天） */
    getDayOfWeek: (date: DateValue) => getDayOfWeek(date, locale),
    getDayOfWeekName,
    getWeeksInMonth: (date: DateValue) => getWeeksInMonth(date, locale),
    isWeekday: (date: DateValue) => isWeekday(date, locale),
    isWeekend: (date: DateValue) => isWeekend(date, locale),
    isSameDay: (a: DateValue, b: DateValue) => isSameDay(a, b),
    isSameMonth: (a: DateValue, b: DateValue) => isSameMonth(a, b),
    isSameYear: (a: DateValue, b: DateValue) => isSameYear(a, b),
    isToday: (date: DateValue) => isToday(date, timeZone),
    isDateValue,
    isDateRange,
    /** 批量转换为 ISO 字符串 */
    convertToISO: <T>(data: T): T => convertData(data, toISO),
    /** 批量转换为格式化字符串 */
    convertToFormatted: <T>(data: T): T => convertData(data, format),
    /** 批量转换为 Date 对象 */
    convertToDate: <T>(data: T): T => convertData(data, value => toDate(value, timeZone)),
    locale,
    timeZone
  }
}

export { CalendarDate } from '@internationalized/date'

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
