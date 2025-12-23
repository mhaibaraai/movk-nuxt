import { describe, it, expect } from 'vitest'
import { useAutoForm } from '../../src/runtime/composables/useAutoForm'
import { z } from 'zod/v4'

describe('useAutoForm', () => {
  const { afz, getAutoFormMetadata, defineControl, DEFAULT_CONTROLS } = useAutoForm()

  describe('基础字段工厂', () => {
    it('string: 应创建字符串 schema', () => {
      const schema = afz.string()
      expect(schema).toBeDefined()
      expect(schema.parse('test')).toBe('test')
      expect(() => schema.parse(123)).toThrow()
    })

    it('string: 应支持错误消息参数', () => {
      const schema = afz.string('自定义错误消息')
      expect(() => schema.parse(null)).toThrow('自定义错误消息')
    })

    it('string: 应支持元数据对象', () => {
      const schema = afz.string({ error: '错误消息', label: '用户名' })
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('用户名')
    })

    it('number: 应创建数字 schema', () => {
      const schema = afz.number()
      expect(schema.parse(123)).toBe(123)
      expect(() => schema.parse('abc')).toThrow()
    })

    it('boolean: 应创建布尔 schema', () => {
      const schema = afz.boolean()
      expect(schema.parse(true)).toBe(true)
      expect(() => schema.parse('true')).toThrow()
    })

    it('file: 应创建文件 schema', () => {
      const schema = afz.file()
      const file = new File(['content'], 'test.txt')
      expect(schema.parse(file)).toBe(file)
    })
  })

  describe('日期和时间字段工厂', () => {
    it('calendarDate: 应创建日历日期 schema', () => {
      const schema = afz.calendarDate()
      const meta = getAutoFormMetadata(schema)
      expect(meta.type).toBe('calendarDate')
    })

    it('calendarDate: 应支持自定义元数据', () => {
      const schema = afz.calendarDate({ label: '出生日期' })
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('出生日期')
      expect(meta.type).toBe('calendarDate')
    })

    it('inputDate: 应创建输入日期 schema', () => {
      const schema = afz.inputDate()
      const meta = getAutoFormMetadata(schema)
      expect(meta.type).toBe('inputDate')
    })

    it('inputTime: 应创建输入时间 schema', () => {
      const schema = afz.inputTime()
      const meta = getAutoFormMetadata(schema)
      expect(meta.type).toBe('inputTime')
    })
  })

  describe('ISO 字符串字段工厂', () => {
    it('isoDatetime: 应创建 ISO datetime schema', () => {
      const schema = afz.isoDatetime()
      expect(schema.parse('2025-12-23T10:00:00Z')).toBe('2025-12-23T10:00:00Z')
      expect(() => schema.parse('invalid')).toThrow()
    })

    it('isoDate: 应创建 ISO date schema', () => {
      const schema = afz.isoDate()
      expect(schema.parse('2025-12-23')).toBe('2025-12-23')
      expect(() => schema.parse('invalid')).toThrow()
    })

    it('isoTime: 应创建 ISO time schema', () => {
      const schema = afz.isoTime()
      expect(schema.parse('10:30:00')).toBe('10:30:00')
      expect(() => schema.parse('invalid')).toThrow()
    })
  })

  describe('Zod v4 验证函数', () => {
    it('email: 应创建 email schema', () => {
      const schema = afz.email()
      expect(schema.parse('test@example.com')).toBe('test@example.com')
      expect(() => schema.parse('invalid-email')).toThrow()
    })

    it('url: 应创建 URL schema', () => {
      const schema = afz.url()
      expect(schema.parse('https://example.com')).toBe('https://example.com')
      expect(() => schema.parse('not-a-url')).toThrow()
    })

    it('uuid: 应创建 UUID schema', () => {
      const schema = afz.uuid()
      const validUuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(schema.parse(validUuid)).toBe(validUuid)
      expect(() => schema.parse('not-a-uuid')).toThrow()
    })
  })

  describe('集合类型工厂', () => {
    it('array: 应创建数组 schema', () => {
      const schema = afz.array(afz.string())
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
      expect(() => schema.parse([1, 2, 3])).toThrow()
    })

    it('array: 应支持 overwrite 元数据', () => {
      const schema = afz.array(afz.string(), { label: '标签列表' })
      const meta = getAutoFormMetadata(schema)
      expect(meta.overwrite).toBeDefined()
      expect(meta.overwrite.label).toBe('标签列表')
    })

    it('tuple: 应创建元组 schema', () => {
      const schema = afz.tuple([afz.string(), afz.number()])
      expect(schema.parse(['test', 123])).toEqual(['test', 123])
      expect(() => schema.parse([123, 'test'])).toThrow()
    })

    it('enum: 应创建枚举 schema', () => {
      const schema = afz.enum(['red', 'green', 'blue'])
      expect(schema.parse('red')).toBe('red')
      expect(() => schema.parse('yellow')).toThrow()
    })

    it('enum: 应从 controlProps.items 中提取枚举值', () => {
      const schema = afz.enum([], {
        controlProps: {
          items: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ],
          valueKey: 'value'
        }
      })
      expect(schema.parse('option1')).toBe('option1')
      expect(() => schema.parse('option3')).toThrow()
    })
  })

  describe('对象类型工厂', () => {
    it('object: 应创建对象 schema', () => {
      const schema = afz.object({
        name: afz.string(),
        age: afz.number()
      })
      expect(schema.parse({ name: 'test', age: 25 })).toEqual({ name: 'test', age: 25 })
    })

    it('object: 应支持元数据参数', () => {
      const schema = afz.object(
        { name: afz.string() },
        { label: '用户信息' }
      )
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('用户信息')
    })

    it('looseObject: 应创建宽松对象 schema', () => {
      const schema = afz.looseObject({
        name: afz.string()
      })
      // 宽松对象应允许额外字段
      expect(schema.parse({ name: 'test', extra: 'field' })).toBeDefined()
    })

    it('strictObject: 应创建严格对象 schema', () => {
      const schema = afz.strictObject({
        name: afz.string()
      })
      expect(schema.parse({ name: 'test' })).toEqual({ name: 'test' })
      expect(() => schema.parse({ name: 'test', extra: 'field' })).toThrow()
    })
  })

  describe('元数据传递机制', () => {
    it('应在链式调用中保持元数据', () => {
      const schema = afz.string({ label: '用户名' }).optional()
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('用户名')
    })

    it('应在多个链式调用中保持元数据', () => {
      const schema = afz.string({ label: '邮箱' })
        .optional()
        .nullable()
        .default('default@example.com')
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('邮箱')
    })

    it('应在 refine 后保持元数据', () => {
      const schema = afz.string({ label: '密码' })
        .refine(val => val.length >= 8, { message: '密码长度至少8位' })
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('密码')
    })

    it('应在 transform 后保持元数据', () => {
      const schema = afz.string({ label: '用户名' })
        .transform(val => val.toLowerCase())
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('用户名')
    })
  })

  describe('布局系统', () => {
    it('layout: 应创建布局配置', () => {
      const layoutSchema = afz.layout({
        type: 'grid',
        columns: 2,
        gap: 4
      })
      const meta = getAutoFormMetadata(layoutSchema)
      expect(meta.type).toBe('__autoform_layout__')
      expect(meta.layout).toBeDefined()
      expect(meta.layout.type).toBe('grid')
      expect(meta.layout.columns).toBe(2)
    })
  })

  describe('defineControl', () => {
    it('应定义控件配置', () => {
      const control = defineControl({
        component: 'CustomComponent' as any,
        controlProps: { placeholder: 'Enter text' }
      })
      expect(control.component).toBe('CustomComponent')
      expect(control.controlProps.placeholder).toBe('Enter text')
    })
  })

  describe('DEFAULT_CONTROLS', () => {
    it('应包含所有默认控件', () => {
      expect(DEFAULT_CONTROLS.string).toBeDefined()
      expect(DEFAULT_CONTROLS.number).toBeDefined()
      expect(DEFAULT_CONTROLS.boolean).toBeDefined()
      expect(DEFAULT_CONTROLS.enum).toBeDefined()
      expect(DEFAULT_CONTROLS.file).toBeDefined()
      expect(DEFAULT_CONTROLS.calendarDate).toBeDefined()
      expect(DEFAULT_CONTROLS.switch).toBeDefined()
      expect(DEFAULT_CONTROLS.textarea).toBeDefined()
      expect(DEFAULT_CONTROLS.slider).toBeDefined()
      expect(DEFAULT_CONTROLS.pinInput).toBeDefined()
      expect(DEFAULT_CONTROLS.inputTags).toBeDefined()
      expect(DEFAULT_CONTROLS.selectMenu).toBeDefined()
      expect(DEFAULT_CONTROLS.inputMenu).toBeDefined()
      expect(DEFAULT_CONTROLS.checkboxGroup).toBeDefined()
      expect(DEFAULT_CONTROLS.radioGroup).toBeDefined()
      expect(DEFAULT_CONTROLS.inputDate).toBeDefined()
      expect(DEFAULT_CONTROLS.inputTime).toBeDefined()
      expect(DEFAULT_CONTROLS.withClear).toBeDefined()
      expect(DEFAULT_CONTROLS.withPasswordToggle).toBeDefined()
      expect(DEFAULT_CONTROLS.withCopy).toBeDefined()
      expect(DEFAULT_CONTROLS.withCharacterLimit).toBeDefined()
      expect(DEFAULT_CONTROLS.colorChooser).toBeDefined()
      expect(DEFAULT_CONTROLS.starRating).toBeDefined()
    })

    it('所有默认控件应有 controlProps', () => {
      Object.values(DEFAULT_CONTROLS).forEach((control) => {
        expect(control.controlProps).toBeDefined()
        expect(control.controlProps.class).toBe('w-full')
      })
    })
  })

  describe('自定义控件集成', () => {
    it('应支持自定义控件映射', () => {
      const customControls = {
        customInput: defineControl({
          component: 'CustomInput' as any,
          controlProps: { custom: true }
        })
      }

      const { afz: customAfz } = useAutoForm(customControls)
      expect(customAfz).toBeDefined()
    })
  })

  describe('复杂 Schema 场景', () => {
    it('应支持嵌套对象', () => {
      const schema = afz.object({
        user: afz.object({
          name: afz.string(),
          email: afz.email()
        }),
        settings: afz.object({
          theme: afz.enum(['light', 'dark']),
          notifications: afz.boolean()
        })
      })

      const data = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        settings: {
          theme: 'dark',
          notifications: true
        }
      }

      expect(schema.parse(data)).toEqual(data)
    })

    it('应支持对象数组', () => {
      const schema = afz.array(
        afz.object({
          id: afz.number(),
          name: afz.string()
        })
      )

      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]

      expect(schema.parse(data)).toEqual(data)
    })

    it('应支持可选和默认值', () => {
      const schema = afz.object({
        required: afz.string(),
        optional: afz.string().optional(),
        withDefault: afz.string().default('default-value')
      })

      expect(schema.parse({ required: 'test' })).toEqual({
        required: 'test',
        optional: undefined,
        withDefault: 'default-value'
      })
    })
  })

  describe('元数据提取', () => {
    it('getAutoFormMetadata: 应提取元数据', () => {
      const schema = afz.string({ label: 'Username', placeholder: 'Enter username' })
      const meta = getAutoFormMetadata(schema)
      expect(meta.label).toBe('Username')
      expect(meta.placeholder).toBe('Enter username')
    })

    it('getAutoFormMetadata: 应处理无元数据的 schema', () => {
      const schema = z.string()
      const meta = getAutoFormMetadata(schema)
      expect(meta).toEqual({})
    })

    it('getAutoFormMetadata: 应从包装类型中提取元数据', () => {
      const innerSchema = afz.string({ label: 'Test' })
      const wrappedSchema = innerSchema.optional()
      const meta = getAutoFormMetadata(wrappedSchema)
      expect(meta.label).toBe('Test')
    })
  })

  describe('错误处理', () => {
    it('应在验证失败时抛出正确的错误', () => {
      const schema = afz.string('必填字段')
      expect(() => schema.parse(null)).toThrow('必填字段')
    })

    it('应在自定义验证中使用元数据错误消息', () => {
      const schema = afz.string({ error: '自定义错误' })
      expect(() => schema.parse(null)).toThrow('自定义错误')
    })

    it('email: 应在无效邮箱时抛出错误', () => {
      const schema = afz.email('无效的邮箱格式')
      expect(() => schema.parse('not-an-email')).toThrow()
    })

    it('url: 应在无效 URL 时抛出错误', () => {
      const schema = afz.url('无效的 URL 格式')
      expect(() => schema.parse('not-a-url')).toThrow()
    })
  })
})
