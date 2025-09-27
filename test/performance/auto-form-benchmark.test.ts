import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod/v4'

import { createAutoFormZ as originalCreateAutoFormZ } from '../../src/runtime/shared/auto-form'
import { createAutoFormZ as optimizedCreateAutoFormZ } from '../../src/runtime/shared/auto-form-optimized'

// 原始版本导入
import { introspectSchema as originalIntrospectSchema } from '../../src/runtime/utils/auto-form'
// 优化版本导入
import { clearAutoFormCaches, introspectSchema as optimizedIntrospectSchema } from '../../src/runtime/utils/auto-form-optimized'

// 测试数据生成
function generateLargeSchema(depth: number = 3, breadth: number = 5) {
  const createLevel = (currentDepth: number): any => {
    if (currentDepth === 0) {
      return {
        field1: z.string(),
        field2: z.number(),
        field3: z.boolean(),
        field4: z.date(),
        field5: z.string().optional(),
      }
    }

    const level: any = {}
    for (let i = 0; i < breadth; i++) {
      level[`field${i}`] = z.string()
      level[`nested${i}`] = z.object(createLevel(currentDepth - 1))
    }
    return level
  }

  return z.object(createLevel(depth))
}

const PERFORMANCE_ITERATIONS = 100
const DEFAULT_CONTROLS = {}

describe('auto-Form 性能基准测试', () => {
  let largeSchema: z.ZodObject<any>
  let complexSchema: z.ZodObject<any>

  beforeEach(() => {
    // 清理缓存确保公平测试
    clearAutoFormCaches()

    // 生成测试数据
    largeSchema = generateLargeSchema(2, 10) // 中等复杂度
    complexSchema = generateLargeSchema(4, 3) // 高深度复杂度
  })

  afterEach(() => {
    clearAutoFormCaches()
  })

  describe('schema 内省性能测试', () => {
    it('简单 Schema - 原始 vs 优化版本', () => {
      const simpleSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      })

      // 原始版本基准
      const originalStart = performance.now()
      for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
        originalIntrospectSchema(simpleSchema, DEFAULT_CONTROLS)
      }
      const originalTime = performance.now() - originalStart

      // 优化版本测试
      const optimizedStart = performance.now()
      for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
        optimizedIntrospectSchema(simpleSchema, DEFAULT_CONTROLS)
      }
      const optimizedTime = performance.now() - optimizedStart

      console.log(`简单 Schema (${PERFORMANCE_ITERATIONS} 次迭代):`)
      console.log(`原始版本: ${originalTime.toFixed(2)}ms`)
      console.log(`优化版本: ${optimizedTime.toFixed(2)}ms`)
      console.log(`性能提升: ${((originalTime - optimizedTime) / originalTime * 100).toFixed(1)}%`)

      // 优化版本应该更快或相当
      expect(optimizedTime).toBeLessThanOrEqual(originalTime * 1.1)
    })

    it('大型 Schema - 原始 vs 优化版本', () => {
      // 原始版本基准
      const originalStart = performance.now()
      for (let i = 0; i < 10; i++) { // 减少迭代次数，因为大型 Schema 处理较慢
        originalIntrospectSchema(largeSchema, DEFAULT_CONTROLS)
      }
      const originalTime = performance.now() - originalStart

      // 优化版本测试
      const optimizedStart = performance.now()
      for (let i = 0; i < 10; i++) {
        optimizedIntrospectSchema(largeSchema, DEFAULT_CONTROLS)
      }
      const optimizedTime = performance.now() - optimizedStart

      console.log(`大型 Schema (10 次迭代):`)
      console.log(`原始版本: ${originalTime.toFixed(2)}ms`)
      console.log(`优化版本: ${optimizedTime.toFixed(2)}ms`)
      console.log(`性能提升: ${((originalTime - optimizedTime) / originalTime * 100).toFixed(1)}%`)

      // 预期显著性能提升
      expect(optimizedTime).toBeLessThan(originalTime * 0.8)
    })

    it('缓存效果测试', () => {
      // 第一次调用（冷启动）
      const firstCallStart = performance.now()
      optimizedIntrospectSchema(complexSchema, DEFAULT_CONTROLS)
      const firstCallTime = performance.now() - firstCallStart

      // 第二次调用（应该利用缓存）
      const secondCallStart = performance.now()
      optimizedIntrospectSchema(complexSchema, DEFAULT_CONTROLS)
      const secondCallTime = performance.now() - secondCallStart

      console.log(`缓存效果测试:`)
      console.log(`首次调用: ${firstCallTime.toFixed(2)}ms`)
      console.log(`缓存调用: ${secondCallTime.toFixed(2)}ms`)
      console.log(`缓存性能提升: ${((firstCallTime - secondCallTime) / firstCallTime * 100).toFixed(1)}%`)

      // 缓存调用应该显著更快
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.5)
    })
  })

  describe('工厂方法性能测试', () => {
    it('afz 工厂方法创建性能', () => {
      // 原始版本
      const originalStart = performance.now()
      for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
        const { afz } = originalCreateAutoFormZ()
        afz.string({ error: 'error message' })
        afz.number({ error: 'number error' })
        afz.boolean()
        afz.date()
      }
      const originalTime = performance.now() - originalStart

      // 优化版本
      const optimizedStart = performance.now()
      for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
        const { afz } = optimizedCreateAutoFormZ()
        afz.string({ error: 'error message' })
        afz.number({ error: 'number error' })
        afz.boolean()
        afz.date()
      }
      const optimizedTime = performance.now() - optimizedStart

      console.log(`工厂方法创建 (${PERFORMANCE_ITERATIONS} 次迭代):`)
      console.log(`原始版本: ${originalTime.toFixed(2)}ms`)
      console.log(`优化版本: ${optimizedTime.toFixed(2)}ms`)
      console.log(`性能提升: ${((originalTime - optimizedTime) / originalTime * 100).toFixed(1)}%`)

      expect(optimizedTime).toBeLessThanOrEqual(originalTime * 1.1)
    })

    it('工厂缓存效果测试', () => {
      const customControls = { test: { component: 'input', controlProps: {}, controlSlots: {} } }

      // 多次创建相同控件的工厂
      const start = performance.now()
      for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
        optimizedCreateAutoFormZ(customControls)
      }
      const time = performance.now() - start

      console.log(`工厂缓存测试 (${PERFORMANCE_ITERATIONS} 次相同控件创建): ${time.toFixed(2)}ms`)

      // 验证缓存机制工作
      const factory1 = optimizedCreateAutoFormZ(customControls)
      const factory2 = optimizedCreateAutoFormZ(customControls)
      expect(factory1.afz).toBe(factory2.afz) // 应该返回缓存的实例
    })
  })

  describe('内存使用测试', () => {
    it('内存泄漏检测', () => {
      const initialMemory = process.memoryUsage().heapUsed

      // 大量操作
      for (let i = 0; i < 1000; i++) {
        const { afz } = optimizedCreateAutoFormZ()
        const schema = afz.object({
          field1: afz.string(),
          field2: afz.number(),
          nested: afz.object({
            subField: afz.string(),
          }),
        })
        optimizedIntrospectSchema(schema, DEFAULT_CONTROLS)
      }

      // 手动垃圾回收（如果可用）
      if (globalThis.gc) {
        globalThis.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      console.log(`内存使用测试:`)
      console.log(`初始内存: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`)
      console.log(`最终内存: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`)
      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)

      // 内存增长应该在合理范围内（小于10MB）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('功能验证测试', () => {
    it('确保优化版本功能完全一致', () => {
      const testSchema = z.object({
        name: z.string().meta({ label: 'Full Name' }),
        age: z.number().optional(),
        nested: z.object({
          email: z.string().email(),
          phone: z.string().default('123-456-7890'),
        }),
      })

      const originalResult = originalIntrospectSchema(testSchema, DEFAULT_CONTROLS)
      const optimizedResult = optimizedIntrospectSchema(testSchema, DEFAULT_CONTROLS)

      // 验证结构一致性
      expect(optimizedResult).toHaveLength(originalResult.length)

      for (let i = 0; i < originalResult.length; i++) {
        const original = originalResult[i]!
        const optimized = optimizedResult[i]!

        expect(optimized.path).toBe(original.path)
        expect(optimized.meta.label).toBe(original.meta.label)
        expect(optimized.decorators).toEqual(original.decorators)

        if (original.children) {
          expect(optimized.children).toHaveLength(original.children.length)
        }
      }
    })
  })
})
