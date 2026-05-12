import { describe, expect, it, vi } from 'vitest'
import { CalendarDate } from '@internationalized/date'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'

vi.mock('../../src/runtime/domains/auto-form/controls', () => ({
  DEFAULT_CONTROLS: {},
  defineControl: <T>(control: T) => control
}))

vi.mock('../../src/runtime/domains/auto-form/fields', () => ({
  extractEnumValuesFromItems: () => []
}))

describe('useAutoForm', () => {
  const { afz } = useAutoForm()
  const fixedDate = new CalendarDate(2025, 11, 29)

  describe('calendarDate', () => {
    it('默认校验 DateValue，拒绝格式化字符串', () => {
      const schema = afz.calendarDate()

      expect(schema.safeParse(fixedDate).success).toBe(true)
      expect(schema.safeParse('2025-11-29').success).toBe(false)
    })

    it('valueFormat: iso 支持单值、范围和数组', () => {
      const schema = afz.calendarDate({ controlProps: { valueFormat: 'iso' } })

      expect(schema.safeParse('2025-11-29').success).toBe(true)
      expect(schema.safeParse({ start: '2025-11-29', end: '2025-12-01' }).success).toBe(true)
      expect(schema.safeParse(['2025-11-29', '2025-12-01']).success).toBe(true)
    })

    it('valueFormat: iso 拒绝无效值、空数组和不完整范围', () => {
      const schema = afz.calendarDate({ controlProps: { valueFormat: 'iso' } })

      expect(schema.safeParse('invalid').success).toBe(false)
      expect(schema.safeParse([]).success).toBe(false)
      expect(schema.safeParse({ start: '2025-11-29' }).success).toBe(false)
      expect(schema.safeParse({ start: '2025-11-29', end: undefined }).success).toBe(false)
    })

    it('valueFormat: timestamp 校验毫秒时间戳', () => {
      const schema = afz.calendarDate({ controlProps: { valueFormat: 'timestamp' } })

      expect(schema.safeParse(Date.UTC(2025, 10, 29)).success).toBe(true)
      expect(schema.safeParse(Number.NaN).success).toBe(false)
    })

    it('valueFormat: unix 校验秒级时间戳', () => {
      const schema = afz.calendarDate({ controlProps: { valueFormat: 'unix' } })

      expect(schema.safeParse(Date.UTC(2025, 10, 29) / 1000).success).toBe(true)
      expect(schema.safeParse(Number.NaN).success).toBe(false)
    })

    it('valueFormat: date 校验 Date 对象', () => {
      const schema = afz.calendarDate({ controlProps: { valueFormat: 'date' } })

      expect(schema.safeParse(new Date(Date.UTC(2025, 10, 29))).success).toBe(true)
      expect(schema.safeParse(new Date('invalid')).success).toBe(false)
    })
  })
})
