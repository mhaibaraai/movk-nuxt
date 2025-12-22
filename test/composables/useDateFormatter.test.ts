import { describe, it, expect } from 'vitest'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { useDateFormatter } from '../../src/runtime/composables/useDateFormatter'

describe('useDateFormatter', () => {
  const fixedDate = new CalendarDate(2025, 11, 29) // 2025-11-29
  const fixedDate2 = new CalendarDate(2025, 12, 1) // 2025-12-01

  describe('初始化', () => {
    it('使用默认配置', () => {
      const formatter = useDateFormatter()
      expect(formatter.locale).toBe('zh-CN')
      expect(formatter.timeZone).toBe(getLocalTimeZone())
    })

    it('支持自定义配置', () => {
      const formatter = useDateFormatter({
        locale: 'en-US',
        timeZone: 'America/New_York',
        formatOptions: { dateStyle: 'short' }
      })
      expect(formatter.locale).toBe('en-US')
      expect(formatter.timeZone).toBe('America/New_York')

      // 简单验证格式化结果
      const result = formatter.format(fixedDate)
      expect(result).toBe('11/29/25')
    })
  })

  describe('格式化方法', () => {
    const formatter = useDateFormatter({ locale: 'zh-CN', timeZone: 'Asia/Shanghai' })

    it('format: 格式化单个日期', () => {
      expect(formatter.format(fixedDate)).toBe('2025年11月29日')
    })

    it('format: 处理空值', () => {
      expect(formatter.format(null)).toBe('')
      expect(formatter.format(undefined)).toBe('')
    })

    it('formatRange: 格式化日期范围', () => {
      expect(formatter.formatRange(fixedDate, fixedDate2)).toBe('2025年11月29日 - 2025年12月1日')
    })

    it('formatRange: 自定义分隔符', () => {
      expect(formatter.formatRange(fixedDate, fixedDate2, ' 至 ')).toBe('2025年11月29日 至 2025年12月1日')
    })

    it('formatArray: 格式化日期数组', () => {
      expect(formatter.formatArray([fixedDate, fixedDate2])).toBe('2025年11月29日, 2025年12月1日')
    })
  })

  describe('转换方法', () => {
    const formatter = useDateFormatter({ timeZone: 'Asia/Shanghai' })

    it('toISO: 转换为 ISO 字符串', () => {
      expect(formatter.toISO(fixedDate)).toBe('2025-11-29')
    })

    it('toDate: 转换为 JS Date 对象', () => {
      const jsDate = formatter.toDate(fixedDate)
      expect(jsDate).toBeInstanceOf(Date)
      expect(jsDate?.getFullYear()).toBe(2025)
      expect(jsDate?.getMonth()).toBe(10) // Month is 0-indexed in JS Date
      expect(jsDate?.getDate()).toBe(29)
    })

    it('toTimestamp: 转换为毫秒时间戳', () => {
      const ts = formatter.toTimestamp(fixedDate)
      expect(typeof ts).toBe('number')
    })

    it('toUnixTimestamp: 转换为秒时间戳', () => {
      const unix = formatter.toUnixTimestamp(fixedDate)
      expect(typeof unix).toBe('number')
    })

    it('parse: 解析 ISO 字符串', () => {
      const date = formatter.parse('2025-11-29')
      expect(date).toBeDefined()
      expect(date?.year).toBe(2025)
      expect(date?.month).toBe(11)
      expect(date?.day).toBe(29)
    })

    it('parse: 解析带时间的 ISO 字符串', () => {
      const dateTime = formatter.parse('2025-11-29T10:30:00')
      expect(dateTime).toBeDefined()
      expect(dateTime?.toString()).toContain('2025-11-29T10:30:00')
    })
  })

  describe('工具方法 - 获取日期', () => {
    const formatter = useDateFormatter({ locale: 'zh-CN', timeZone: 'Asia/Shanghai' })

    it('getToday: 获取今天', () => {
      const t = formatter.getToday()
      expect(t).toBeDefined()
      expect(t.year).toBeGreaterThan(2020)
    })

    // 测试 startOfWeek 等方法通常依赖于具体 locale，zh-CN 一周从周一开始
    it('getStartOfWeek: 获取周始', () => {
      // 2025-11-29 is Saturday
      const startOfWeek = formatter.getStartOfWeek(fixedDate)
      // zh-CN starts on Monday. Monday before 29th is 24th.
      expect(startOfWeek.day).toBe(24)
    })

    it('getEndOfMonth: 获取月末', () => {
      const endOfMonth = formatter.getEndOfMonth(fixedDate)
      expect(endOfMonth.day).toBe(30)
    })
  })

  describe('工具方法 - 查询', () => {
    const formatter = useDateFormatter({ locale: 'zh-CN' })

    it('getDayOfWeek: 获取星期几数字', () => {
      // 2025-11-29 is Saturday
      // In zh-CN locale, week starts on Monday (0), so Saturday is 5
      expect(formatter.getDayOfWeek(fixedDate)).toBe(5)
    })

    it('getDayOfWeekName: 获取星期几名称 (long)', () => {
      // 2025-11-29 is Saturday
      expect(formatter.getDayOfWeekName(fixedDate)).toBe('星期六')
      expect(formatter.getDayOfWeekName(fixedDate, 'long')).toBe('星期六')
    })

    it('getDayOfWeekName: 获取星期几名称 (short)', () => {
      // 2025-11-29 is Saturday
      expect(formatter.getDayOfWeekName(fixedDate, 'short')).toBe('周六')
    })

    it('getDayOfWeekName: 获取星期几名称 (narrow)', () => {
      // 2025-11-29 is Saturday
      expect(formatter.getDayOfWeekName(fixedDate, 'narrow')).toBe('六')
    })

    it('getDayOfWeekName: 支持不同 locale', () => {
      const enFormatter = useDateFormatter({ locale: 'en-US' })
      // 2025-11-29 is Saturday
      expect(enFormatter.getDayOfWeekName(fixedDate)).toBe('Saturday')
      expect(enFormatter.getDayOfWeekName(fixedDate, 'short')).toBe('Sat')
      expect(enFormatter.getDayOfWeekName(fixedDate, 'narrow')).toBe('S')
    })

    it('isWeekend: 判断周末', () => {
      // 2025-11-29 is Saturday
      expect(formatter.isWeekend(fixedDate)).toBe(true)
      // 2025-11-26 is Wednesday
      const wednesday = new CalendarDate(2025, 11, 26)
      expect(formatter.isWeekend(wednesday)).toBe(false)
    })

    it('isSameDay: 判断同一天', () => {
      const d1 = new CalendarDate(2025, 11, 29)
      const d2 = new CalendarDate(2025, 11, 29)
      const d3 = new CalendarDate(2025, 11, 30)
      expect(formatter.isSameDay(d1, d2)).toBe(true)
      expect(formatter.isSameDay(d1, d3)).toBe(false)
    })

    it('isDateValue: 类型守卫', () => {
      expect(formatter.isDateValue(fixedDate)).toBe(true)
      expect(formatter.isDateValue('string')).toBe(false)
      expect(formatter.isDateValue(null)).toBe(false)
    })

    it('isDateRange: 类型守卫', () => {
      const range = { start: fixedDate, end: fixedDate2 }
      expect(formatter.isDateRange(range)).toBe(true)
      expect(formatter.isDateRange(fixedDate)).toBe(false)
    })
  })

  describe('批量转换方法', () => {
    const formatter = useDateFormatter()

    it('convertToISO: 批量转换对象', () => {
      const data = {
        date: fixedDate,
        nested: {
          date: fixedDate2
        },
        array: [fixedDate, fixedDate2],
        range: { start: fixedDate, end: fixedDate2 },
        other: 'string'
      }

      const result = formatter.convertToISO(data)

      expect(result).toEqual({
        date: '2025-11-29',
        nested: {
          date: '2025-12-01'
        },
        array: ['2025-11-29', '2025-12-01'],
        range: { start: '2025-11-29', end: '2025-12-01' },
        other: 'string'
      })
    })

    it('convertToFormatted: 批量格式化', () => {
      const data = { date: fixedDate }
      const result = formatter.convertToFormatted(data)
      // 默认 zh-CN medium
      expect(result.date).toBe('2025年11月29日')
    })
  })
})
